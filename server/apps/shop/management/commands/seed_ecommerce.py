import hashlib
import os
from io import BytesIO
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from PIL import Image

from apps.blog.models import (
    BlogCategory,
    BlogCategoryViewCount,
    Post,
    PostComment,
    PostViewCount,
)
from apps.coupons.models import Coupon, UserCoupon
from apps.delivery.models import Address
from apps.home.models import Banner
from apps.purchase.models import Purchase, PurchaseDelivery, PurchaseItem
from apps.shop.models import (
    Category,
    CategoryViewCount,
    Product,
    ProductComment,
    ProductDimensions,
    ProductFeatures,
    ProductImages,
    ProductViewCount,
)

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Seed completo para el e-commerce demo: banners, categorías, marcas, "
        "productos, blog, cupones, usuarios demo y una compra de ejemplo."
    )

    placeholder_dir = Path(settings.BASE_DIR) / "static-ecw" / "static" / "imgs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--with-order",
            action="store_true",
            help="Crea también una compra demo con items, cupón y dirección.",
        )

    def handle(self, *args, **options):
        self.with_order = options["with_order"]

        with transaction.atomic():
            admin_user = self.ensure_admin_user()
            customer_user = self.ensure_customer_user()

            self.seed_banners()
            specials = self.seed_special_categories()
            categories = self.seed_categories(specials)
            brands = self.seed_brands(categories)
            products = self.seed_products(specials, categories, brands)
            self.seed_product_extras(products, admin_user, customer_user)

            blog_categories = self.seed_blog_categories()
            posts = self.seed_posts(blog_categories, admin_user)
            self.seed_post_comments(posts, admin_user, customer_user)

            coupons = self.seed_coupons(customer_user)
            self.seed_address(customer_user)

            if self.with_order:
                self.seed_order(customer_user, products, coupons)

        self.stdout.write(self.style.SUCCESS("Seed e-commerce completado correctamente."))

        super_password_defined = bool(os.getenv("SUPER_PASSWORD"))
        demo_password_defined = bool(os.getenv("DEMO_PASSWORD"))

        if super_password_defined and demo_password_defined:
            self.stdout.write(
                self.style.SUCCESS(
                    "Usuarios demo creados con contraseñas definidas desde variables de entorno."
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "Usuarios demo creados. Si quieres contraseñas utilizables, define "
                    "SUPER_PASSWORD y DEMO_PASSWORD antes de ejecutar el comando."
                )
            )

    def require_placeholder(self, filename: str) -> Path:
        path = self.placeholder_dir / filename
        if not path.exists():
            raise FileNotFoundError(
                f"No se encontró la imagen placeholder requerida: {path}"
            )
        return path

    def tinted_image_content(self, filename: str, key: str, blend_alpha: float = 0.28) -> ContentFile:
        image_path = self.require_placeholder(filename)
        digest = hashlib.md5(key.encode("utf-8")).digest()
        tint = (digest[0], digest[1], digest[2])

        with Image.open(image_path) as original_image:
            original = original_image.convert("RGB")
            solid = Image.new("RGB", original.size, tint)
            blended = Image.blend(original, solid, alpha=blend_alpha)
            buffer = BytesIO()
            blended.save(buffer, format="JPEG")
            return ContentFile(buffer.getvalue())

    def assign_image(self, field, filename: str, key: str, output_name: str, force: bool = False):
        if field and getattr(field, "name", None) and not force:
            return
        content = self.tinted_image_content(filename=filename, key=key)
        field.save(output_name, content, save=False)

    def sync_counter(self, model, relation_field: str, instance, target_count: int):
        current = model.objects.filter(**{relation_field: instance}).count()
        if current == target_count:
            return
        if current > target_count:
            excess = model.objects.filter(**{relation_field: instance})[target_count:]
            for item in excess:
                item.delete()
            return
        for index in range(current, target_count):
            kwargs = {relation_field: instance, "ip_address": f"10.0.{target_count}.{index}"}
            model.objects.create(**kwargs)

    def lorem(self) -> str:
        return (
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
            "Vestibulum vitae libero eget mauris porta efficitur. "
            "Donec tincidunt, nisi a facilisis consequat, tellus purus "
            "ullamcorper velit, ut scelerisque metus lorem at sapien."
        )

    def ensure_admin_user(self):
        username = os.getenv("SUPER_USERNAME", "support-cf")
        email = os.getenv("SUPER_EMAIL", "support@codefusion.cl")
        password = os.getenv("SUPER_PASSWORD")

        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name="support",
                last_name="CodeFusion",
            )
        user.username = username
        user.first_name = user.first_name or "support"
        user.last_name = user.last_name or "CodeFusion"
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        if password:
            user.set_password(password)
        user.save()
        return user

    def ensure_customer_user(self):
        email = "demo@codefusion.cl"
        password = os.getenv("DEMO_PASSWORD")
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(
                username="demo-client",
                email=email,
                first_name="Cliente",
                last_name="Demo",
                password=password,
                is_active=True,
            )
        else:
            user.username = user.username or "demo-client"
            user.first_name = user.first_name or "Cliente"
            user.last_name = user.last_name or "Demo"
            user.is_active = True
            if password:
                user.set_password(password)
            user.save()
        return user

    def seed_banners(self):
        banners_data = [
            ("selected", "hero-tech"),
            ("selected", "ofertas-flash"),
            ("selected", "gaming-week"),
            ("selected", "smart-home"),
        ]
        for status, alt in banners_data:
            banner, _ = Banner.objects.get_or_create(alt=alt, defaults={"status": status})
            banner.status = status
            self.assign_image(
                banner.thumbnail,
                filename="sampleBannerImage.jpeg",
                key=f"banner:{alt}",
                output_name=f"banner-{alt}.jpeg",
            )
            banner.save()

    def seed_special_categories(self):
        names = [
            "Ofertas Flash",
            "Lo Nuevo",
            "Top Ventas",
            "Edición Limitada",
        ]
        results = []
        for index, name in enumerate(names, start=1):
            slug = f"special-{index}"
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "type": "special",
                    "views": 120 - index * 5,
                },
            )
            category.name = name
            category.type = "special"
            category.views = 120 - index * 5
            self.assign_image(
                category.icon,
                filename="sampleCategoryImage.jpeg",
                key=f"special:{slug}",
                output_name=f"special-{slug}.jpeg",
            )
            category.save()
            self.sync_counter(CategoryViewCount, "category", category, category.views)
            results.append(category)
        return results

    def seed_categories(self, specials):
        names = [
            "Computación",
            "Audio",
            "Gaming",
            "Smart Home",
            "Accesorios",
            "Movilidad",
        ]
        results = []
        for index, name in enumerate(names, start=1):
            slug = f"category-{index}"
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "type": "category",
                    "views": 90 - index * 4,
                },
            )
            category.name = name
            category.type = "category"
            category.views = 90 - index * 4
            self.assign_image(
                category.icon,
                filename="sampleCategoryImage.jpeg",
                key=f"category:{slug}",
                output_name=f"category-{slug}.jpeg",
            )
            category.save()
            category.subcategories.add(specials[index % len(specials)])
            self.sync_counter(CategoryViewCount, "category", category, category.views)
            results.append(category)
        return results

    def seed_brands(self, categories):
        names = [
            "NovaTech",
            "PixelWave",
            "Quantum Gear",
            "BlueCore",
            "HyperByte",
            "VoltEdge",
            "Axiom",
            "Nebula Labs",
            "Vertex",
            "Fusion Devices",
        ]
        results = []
        for index, name in enumerate(names, start=1):
            slug = f"brand-{index}"
            brand, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "type": "brand",
                    "views": 75 - index * 3,
                },
            )
            brand.name = name
            brand.type = "brand"
            brand.views = 75 - index * 3
            self.assign_image(
                brand.icon,
                filename="sampleCategoryImage.jpeg",
                key=f"brand:{slug}",
                output_name=f"brand-{slug}.jpeg",
            )
            brand.save()
            for category in categories:
                category.subcategories.add(brand)
            self.sync_counter(CategoryViewCount, "category", brand, brand.views)
            results.append(brand)
        return results

    def seed_products(self, specials, categories, brands):
        product_specs = [
            ("Aurora Laptop Pro", 849990, 18),
            ("Pulse Wireless Headset", 89990, 35),
            ("Nebula Mechanical Keyboard", 69990, 28),
            ("Orbit Gaming Mouse", 49990, 42),
            ("Nova Smart Speaker", 119990, 14),
            ("Vertex 4K Monitor", 259990, 11),
            ("Hyper Portable SSD", 79990, 26),
            ("BlueCore Webcam HD", 45990, 33),
            ("Quantum Desk Lamp", 29990, 24),
            ("Fusion Dock Station", 109990, 16),
            ("VoltEdge Smartwatch", 149990, 13),
            ("Axiom Power Bank", 39990, 37),
        ]

        results = []
        for index, (name, price, stock) in enumerate(product_specs, start=1):
            slug = f"product-{index}"
            product = Product.objects.filter(slug=slug).first()
            if not product:
                product = Product(
                    name=name,
                    slug=slug,
                    price=price,
                    description=f"{self.lorem()} Producto demo orientado a {name.lower()}.",
                    stock=stock,
                    status="on_sale",
                    views=110 - index * 4,
                )
            else:
                product.name = name
                product.price = price
                product.description = f"{self.lorem()} Producto demo orientado a {name.lower()}."
                product.stock = stock
                product.status = "on_sale"
                product.views = 110 - index * 4

            self.assign_image(
                product.thumbnail,
                filename="sampleImage.jpeg",
                key=f"product:{slug}",
                output_name=f"product-{slug}.jpeg",
            )
            product.save()
            product.categories.set(
                [
                    specials[index % len(specials)],
                    categories[index % len(categories)],
                    brands[index % len(brands)],
                ]
            )
            self.sync_counter(ProductViewCount, "product", product, product.views)
            results.append(product)
        return results

    def seed_product_extras(self, products, admin_user, customer_user):
        feature_sets = [
            [("Color", "Azul"), ("Garantía", "12 meses"), ("Compatibilidad", "Universal")],
            [("Conectividad", "Bluetooth 5.3"), ("Batería", "Hasta 20 horas"), ("Material", "Aluminio")],
            [("Resolución", "4K"), ("Frecuencia", "144Hz"), ("Puertos", "USB-C / HDMI")],
        ]
        product_comments = [
            "Muy buen producto para una demo de tienda, responde rápido y se ve premium.",
            "La relación precio/calidad está sólida, ideal para probar el flujo completo.",
        ]

        for index, product in enumerate(products, start=1):
            ProductDimensions.objects.update_or_create(
                product=product,
                defaults={
                    "weight": round(0.8 + index * 0.1, 2),
                    "height": round(10 + index * 0.5, 2),
                    "width": round(8 + index * 0.4, 2),
                    "length": round(2 + index * 0.2, 2),
                },
            )

            ProductFeatures.objects.filter(product=product).delete()
            for param, value in feature_sets[index % len(feature_sets)]:
                ProductFeatures.objects.create(product=product, param=param, value=value)

            if ProductImages.objects.filter(product=product).count() < 2:
                ProductImages.objects.filter(product=product).delete()
                for extra_index in range(1, 3):
                    image = ProductImages(product=product)
                    self.assign_image(
                        image.image,
                        filename="sampleImage.jpeg",
                        key=f"product-extra:{product.slug}:{extra_index}",
                        output_name=f"product-extra-{product.slug}-{extra_index}.jpeg",
                        force=True,
                    )
                    image.save()

            if ProductComment.objects.filter(product=product).count() == 0:
                ProductComment.objects.create(
                    user=admin_user,
                    product=product,
                    comment=product_comments[0],
                    stars=5,
                )
                ProductComment.objects.create(
                    user=customer_user,
                    product=product,
                    comment=product_comments[1],
                    stars=4,
                )

    def seed_blog_categories(self):
        names = ["Guías", "Novedades", "Comparativas"]
        results = []
        for index, name in enumerate(names, start=1):
            slug = f"blog-category-{index}"
            category, _ = BlogCategory.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": self.lorem(),
                    "views": 40 - index * 2,
                },
            )
            category.name = name
            category.description = self.lorem()
            category.views = 40 - index * 2
            self.assign_image(
                category.icon,
                filename="sampleCategoryImage.jpeg",
                key=f"blog-category:{slug}",
                output_name=f"blog-category-{slug}.jpeg",
            )
            category.save()
            self.sync_counter(BlogCategoryViewCount, "blog_category", category, category.views)
            results.append(category)
        return results

    def build_post_content(self, title: str, image_url: str) -> str:
        return (
            f"<div class='flex column box-xxl margin-center gap-s margin-t-s third-color'>"
            f"<h1>{title}</h1>"
            f"<p>{self.lorem()}</p>"
            f"<img class='box-xxl f-height-m fit-contain' src='{image_url}' alt='{title}' />"
            f"<p>{self.lorem()}</p>"
            f"</div>"
        )

    def seed_posts(self, blog_categories, admin_user):
        titles = [
            "Cómo elegir un setup tech equilibrado",
            "Accesorios que mejoran tu escritorio",
            "Monitores: qué revisar antes de comprar",
            "Tendencias smart home para este año",
            "Periféricos gaming que sí valen la pena",
            "Checklist para renovar tu notebook",
            "Audio inalámbrico sin vender humo",
            "Ideas de regalos tech para una tienda demo",
        ]
        results = []
        for index, title in enumerate(titles, start=1):
            slug = f"post-{index}"
            post, _ = Post.objects.get_or_create(
                slug=slug,
                defaults={
                    "status": "active",
                    "description": self.lorem(),
                    "title": title,
                    "author": admin_user,
                    "views": 55 - index * 3,
                },
            )
            post.status = "active"
            post.description = self.lorem()
            post.title = title
            post.author = admin_user
            post.views = 55 - index * 3
            self.assign_image(
                post.thumbnail,
                filename="samplePostImage.jpeg",
                key=f"post:{slug}",
                output_name=f"post-{slug}.jpeg",
            )
            post.save()
            post.categories.set([blog_categories[index % len(blog_categories)]])
            post.content = self.build_post_content(post.title, post.thumbnail.url)
            post.save(update_fields=["content"])
            self.sync_counter(PostViewCount, "post", post, post.views)
            results.append(post)
        return results

    def seed_post_comments(self, posts, admin_user, customer_user):
        for post in posts:
            if PostComment.objects.filter(post=post).count() == 0:
                PostComment.objects.create(
                    user=admin_user,
                    post=post,
                    comment="Buen artículo para poblar la sección de blog y validar el frontend.",
                    stars=5,
                )
                PostComment.objects.create(
                    user=customer_user,
                    post=post,
                    comment="Se entiende bien y sirve para revisar el flujo del detalle del post.",
                    stars=4,
                )

    def seed_coupons(self, customer_user):
        expiration = timezone.now() + timezone.timedelta(days=60)
        coupons_data = [
            ("WELCOME10", "percent", 10, None),
            ("SAVE5000", "value", None, 5000),
            ("FREESHIP", "free_delivery", None, None),
        ]
        results = []
        for code, discount_type, discount_percent, discount_value in coupons_data:
            coupon, _ = Coupon.objects.get_or_create(
                code=code,
                defaults={
                    "discount_type": discount_type,
                    "discount_percent": discount_percent,
                    "discount_value": discount_value,
                    "limit": 150,
                    "discount_expire": expiration,
                },
            )
            coupon.discount_type = discount_type
            coupon.discount_percent = discount_percent
            coupon.discount_value = discount_value
            coupon.limit = 150
            coupon.discount_expire = expiration
            coupon.save()
            user_coupon, _ = UserCoupon.objects.get_or_create(
                user=customer_user,
                coupon=coupon,
                defaults={"status": "is_claimed"},
            )
            user_coupon.status = user_coupon.status or "is_claimed"
            user_coupon.save()
            results.append(user_coupon)
        return results

    def seed_address(self, customer_user):
        address, _ = Address.objects.get_or_create(
            user=customer_user,
            streetName="Av. Demo",
            streetNumber="1234",
            defaults={
                "regionName": "Región Metropolitana",
                "regionCode": "RM",
                "countyName": "Maipú",
                "countyCode": "13119",
                "postalCode": "9250000",
                "lat": -33.5111,
                "lng": -70.7617,
                "phoneNumber": "+56911111111",
                "comment": "Dirección demo para pruebas del checkout.",
                "isDefault": True,
            },
        )
        address.regionName = "Región Metropolitana"
        address.regionCode = "RM"
        address.countyName = "Maipú"
        address.countyCode = "13119"
        address.postalCode = "9250000"
        address.lat = -33.5111
        address.lng = -70.7617
        address.phoneNumber = "+56911111111"
        address.comment = "Dirección demo para pruebas del checkout."
        address.isDefault = True
        address.save()
        return address

    def seed_order(self, customer_user, products, coupons):
        if len(products) < 3:
            return
        applied_coupon = coupons[0] if coupons else None
        if applied_coupon:
            applied_coupon.status = "is_applied"
            applied_coupon.save(update_fields=["status"])

        selected_products = products[:3]
        subtotal = sum(product.price for product in selected_products)
        discount = int(subtotal * 0.10) if applied_coupon else 0
        delivery_cost = 3990
        total = subtotal - discount + delivery_cost

        purchase, _ = Purchase.objects.get_or_create(
            code="ORDER-DEMO-001",
            user=customer_user,
            defaults={
                "discount": discount,
                "coupon": applied_coupon,
                "subtotal": subtotal,
                "deliveryCost": delivery_cost,
                "total": total,
                "status": "payed",
            },
        )
        purchase.discount = discount
        purchase.coupon = applied_coupon
        purchase.subtotal = subtotal
        purchase.deliveryCost = delivery_cost
        purchase.total = total
        purchase.status = "payed"
        purchase.save()

        PurchaseItem.objects.filter(purchase=purchase).delete()
        for product in selected_products:
            PurchaseItem.objects.create(purchase=purchase, product=product, quantity=1)

        PurchaseDelivery.objects.update_or_create(
            purchase=purchase,
            courierType="home_delivery",
            defaults={
                "region": "Región Metropolitana",
                "commune": "Maipú",
                "street": "Av. Demo",
                "streetNumber": "1234",
                "courier": "CHILEXPRESS",
                "status": "receivedForCourier",
                "shipmentNumber": 10001,
            },
        )
