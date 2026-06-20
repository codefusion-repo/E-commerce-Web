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

    def catalog_specials(self):
        return [
            {"name": "Ofertas demo", "views": 138},
            {"name": "Nuevos ingresos", "views": 132},
            {"name": "Más vendidos", "views": 126},
            {"name": "Selección portfolio", "views": 120},
        ]

    def catalog_categories(self):
        return [
            {"name": "Notebooks y productividad", "views": 118, "special_index": 1},
            {"name": "Audio personal", "views": 112, "special_index": 2},
            {"name": "Periféricos gaming", "views": 108, "special_index": 0},
            {"name": "Casa inteligente", "views": 102, "special_index": 3},
            {"name": "Accesorios y energía", "views": 98, "special_index": 0},
            {"name": "Monitores y streaming", "views": 94, "special_index": 2},
        ]

    def catalog_brands(self):
        return [
            {"name": "CodeFusion Lab", "views": 96},
            {"name": "AndesTech", "views": 91},
            {"name": "PuntoPixel", "views": 86},
            {"name": "Nexo Audio", "views": 82},
            {"name": "Voltia", "views": 78},
            {"name": "CasaNube", "views": 74},
            {"name": "Raven Gaming", "views": 70},
            {"name": "MiraDisplay", "views": 66},
            {"name": "Ruta Mobile", "views": 62},
            {"name": "Taller Digital", "views": 58},
        ]

    def catalog_products(self):
        return [
            {
                "name": "Notebook Andes Studio 14",
                "price": 749990,
                "stock": 10,
                "views": 168,
                "special_index": 1,
                "category_index": 0,
                "brand_index": 1,
                "description": (
                    "Notebook liviano para trabajo remoto, presentaciones y demos. "
                    "Equilibra potencia, batería y portabilidad en una vitrina clara "
                    "para probar búsqueda, carrito y checkout."
                ),
                "features": [
                    ("Pantalla", "14 pulgadas IPS"),
                    ("Memoria", "16 GB RAM / 512 GB SSD"),
                    ("Uso sugerido", "Productividad y demos SaaS"),
                ],
            },
            {
                "name": "Audífonos Nexo Air ANC",
                "price": 89990,
                "stock": 32,
                "views": 160,
                "special_index": 2,
                "category_index": 1,
                "brand_index": 3,
                "description": (
                    "Audífonos inalámbricos con cancelación activa de ruido y estuche "
                    "compacto. Pensados para destacar un producto de precio medio con "
                    "copy breve, rating y acciones visibles."
                ),
                "features": [
                    ("Cancelación", "ANC híbrida"),
                    ("Batería", "Hasta 28 horas con estuche"),
                    ("Conectividad", "Bluetooth 5.3 multipunto"),
                ],
            },
            {
                "name": "Teclado Raven Pro TKL",
                "price": 69990,
                "stock": 28,
                "views": 154,
                "special_index": 0,
                "category_index": 2,
                "brand_index": 6,
                "description": (
                    "Teclado mecánico compacto para setups gaming y escritorios de "
                    "desarrollo. Su formato TKL muestra bien filtros por categoría, marca "
                    "y rango de precio."
                ),
                "features": [
                    ("Formato", "TKL con switches lineales"),
                    ("Iluminación", "RGB por tecla"),
                    ("Conexión", "USB-C desmontable"),
                ],
            },
            {
                "name": "Monitor MiraView 27 4K",
                "price": 289990,
                "stock": 14,
                "views": 148,
                "special_index": 2,
                "category_index": 5,
                "brand_index": 7,
                "description": (
                    "Monitor 4K de 27 pulgadas para edición, streaming y trabajo diario. "
                    "Aporta una referencia premium al catálogo sin alterar flujos de compra."
                ),
                "features": [
                    ("Resolución", "4K UHD"),
                    ("Frecuencia", "60 Hz"),
                    ("Puertos", "HDMI, DisplayPort y USB-C"),
                ],
            },
            {
                "name": "Mouse Raven Vector",
                "price": 39990,
                "stock": 40,
                "views": 140,
                "special_index": 0,
                "category_index": 2,
                "brand_index": 6,
                "description": (
                    "Mouse liviano con sensor preciso y botones programables. Sirve para "
                    "probar productos de alta rotación en cards, búsqueda y carrito."
                ),
                "features": [
                    ("Sensor", "Hasta 12.000 DPI"),
                    ("Peso", "72 gramos"),
                    ("Botones", "6 programables"),
                ],
            },
            {
                "name": "Parlante CasaNube 360",
                "price": 119990,
                "stock": 18,
                "views": 134,
                "special_index": 3,
                "category_index": 3,
                "brand_index": 5,
                "description": (
                    "Parlante inteligente para ambientes conectados, con sonido envolvente "
                    "y control por app. Refuerza la categoría smart home con un producto "
                    "fácil de entender."
                ),
                "features": [
                    ("Audio", "Sonido 360 grados"),
                    ("Control", "App móvil y voz"),
                    ("Conectividad", "Wi-Fi y Bluetooth"),
                ],
            },
            {
                "name": "Dock USB-C CodeFusion 8 en 1",
                "price": 79990,
                "stock": 22,
                "views": 128,
                "special_index": 1,
                "category_index": 4,
                "brand_index": 0,
                "description": (
                    "Hub USB-C con puertos esenciales para notebooks modernos. Un producto "
                    "de apoyo que comunica bien compatibilidad, precio y disponibilidad."
                ),
                "features": [
                    ("Puertos", "HDMI, USB-A, USB-C y SD"),
                    ("Carga", "Power Delivery 100 W"),
                    ("Material", "Aluminio anodizado"),
                ],
            },
            {
                "name": "Power Bank Voltia 20K",
                "price": 44990,
                "stock": 35,
                "views": 122,
                "special_index": 0,
                "category_index": 4,
                "brand_index": 4,
                "description": (
                    "Batería externa de 20.000 mAh para viajes, ferias y jornadas largas. "
                    "Completa el catálogo con un accesorio masivo y precio accesible."
                ),
                "features": [
                    ("Capacidad", "20.000 mAh"),
                    ("Carga rápida", "USB-C PD 30 W"),
                    ("Pantalla", "Indicador digital"),
                ],
            },
            {
                "name": "Webcam PuntoPixel Full HD",
                "price": 54990,
                "stock": 30,
                "views": 116,
                "special_index": 1,
                "category_index": 5,
                "brand_index": 2,
                "description": (
                    "Webcam Full HD con micrófono integrado para reuniones y streaming. "
                    "Ayuda a mostrar información técnica simple en la ficha del producto."
                ),
                "features": [
                    ("Resolución", "1080p a 30 fps"),
                    ("Audio", "Micrófono integrado"),
                    ("Montaje", "Clip ajustable"),
                ],
            },
            {
                "name": "SSD externo Andes 1TB",
                "price": 99990,
                "stock": 24,
                "views": 110,
                "special_index": 3,
                "category_index": 4,
                "brand_index": 1,
                "description": (
                    "Unidad SSD portátil para respaldos, proyectos y archivos pesados. "
                    "Suma un ejemplo claro para ordenar por precio y comparar accesorios."
                ),
                "features": [
                    ("Capacidad", "1 TB"),
                    ("Velocidad", "Hasta 1.050 MB/s"),
                    ("Resistencia", "Carcasa reforzada"),
                ],
            },
            {
                "name": "Ampolleta CasaNube Color",
                "price": 24990,
                "stock": 50,
                "views": 104,
                "special_index": 0,
                "category_index": 3,
                "brand_index": 5,
                "description": (
                    "Ampolleta LED inteligente con escenas de color y programación desde "
                    "app. Da variedad al catálogo con un producto compacto de bajo ticket."
                ),
                "features": [
                    ("Color", "RGB + blanco cálido"),
                    ("Control", "App móvil"),
                    ("Consumo", "9 W LED"),
                ],
            },
            {
                "name": "Soporte Ruta Mobile MagSafe",
                "price": 29990,
                "stock": 38,
                "views": 98,
                "special_index": 2,
                "category_index": 4,
                "brand_index": 8,
                "description": (
                    "Soporte magnético para escritorio o auto, ideal para navegación y "
                    "videollamadas. Cierra la selección con un accesorio simple y visible."
                ),
                "features": [
                    ("Montaje", "Magnético compatible MagSafe"),
                    ("Rotación", "360 grados"),
                    ("Uso", "Escritorio y vehículo"),
                ],
            },
        ]

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
        results = []
        for index, special_data in enumerate(self.catalog_specials(), start=1):
            name = special_data["name"]
            slug = f"special-{index}"
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "type": "special",
                    "views": special_data["views"],
                },
            )
            category.name = name
            category.type = "special"
            category.views = special_data["views"]
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
        results = []
        for index, category_data in enumerate(self.catalog_categories(), start=1):
            name = category_data["name"]
            slug = f"category-{index}"
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "type": "category",
                    "views": category_data["views"],
                },
            )
            category.name = name
            category.type = "category"
            category.views = category_data["views"]
            self.assign_image(
                category.icon,
                filename="sampleCategoryImage.jpeg",
                key=f"category:{slug}",
                output_name=f"category-{slug}.jpeg",
            )
            category.save()
            category.subcategories.add(specials[category_data["special_index"]])
            self.sync_counter(CategoryViewCount, "category", category, category.views)
            results.append(category)
        return results

    def seed_brands(self, categories):
        results = []
        for index, brand_data in enumerate(self.catalog_brands(), start=1):
            name = brand_data["name"]
            slug = f"brand-{index}"
            brand, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "type": "brand",
                    "views": brand_data["views"],
                },
            )
            brand.name = name
            brand.type = "brand"
            brand.views = brand_data["views"]
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
        results = []
        for index, product_data in enumerate(self.catalog_products(), start=1):
            slug = f"product-{index}"
            product = Product.objects.filter(slug=slug).first()
            if not product:
                product = Product(
                    name=product_data["name"],
                    slug=slug,
                    price=product_data["price"],
                    description=product_data["description"],
                    stock=product_data["stock"],
                    status="on_sale",
                    views=product_data["views"],
                )
            else:
                product.name = product_data["name"]
                product.price = product_data["price"]
                product.description = product_data["description"]
                product.stock = product_data["stock"]
                product.status = "on_sale"
                product.views = product_data["views"]

            self.assign_image(
                product.thumbnail,
                filename="sampleImage.jpeg",
                key=f"product:{slug}",
                output_name=f"product-{slug}.jpeg",
            )
            product.save()
            product.categories.set(
                [
                    specials[product_data["special_index"]],
                    categories[product_data["category_index"]],
                    brands[product_data["brand_index"]],
                ]
            )
            self.sync_counter(ProductViewCount, "product", product, product.views)
            results.append(product)
        return results

    def seed_product_extras(self, products, admin_user, customer_user):
        feature_map = {
            f"product-{index}": product_data["features"]
            for index, product_data in enumerate(self.catalog_products(), start=1)
        }
        product_comments = [
            "La ficha se entiende rápido y el producto se ve listo para una demo comercial.",
            "Buen ejemplo para revisar precio, disponibilidad y compra sin datos sensibles.",
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
            for param, value in feature_map.get(product.slug, []):
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
