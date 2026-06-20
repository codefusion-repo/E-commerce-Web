import os
import sys
import django

# Configura la ruta a tu proyecto Django (ajústala según tu estructura)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")  # Cambia "myproject" al nombre de tu proyecto

# Inicializa Django
django.setup()

from django.contrib.auth import get_user_model
import environ

import random
import string
from django.core.files import File
from PIL import Image
from io import BytesIO
from apps.shop.models import Category, Product
from apps.home.models import Banner
from apps.blog.models import BlogCategory, Post

env = environ.Env()
environ.Env.read_env()

User = get_user_model()

CATALOG_SPECIALS = [
    "Ofertas demo",
    "Nuevos ingresos",
    "Más vendidos",
    "Selección portfolio",
]

CATALOG_CATEGORIES = [
    {"name": "Notebooks y productividad", "special_index": 1},
    {"name": "Audio personal", "special_index": 2},
    {"name": "Periféricos gaming", "special_index": 0},
    {"name": "Casa inteligente", "special_index": 3},
    {"name": "Accesorios y energía", "special_index": 0},
    {"name": "Monitores y streaming", "special_index": 2},
]

CATALOG_BRANDS = [
    "CodeFusion Lab",
    "AndesTech",
    "PuntoPixel",
    "Nexo Audio",
    "Voltia",
    "CasaNube",
    "Raven Gaming",
    "MiraDisplay",
    "Ruta Mobile",
    "Taller Digital",
]

CATALOG_PRODUCTS = [
    {
        "name": "Notebook Andes Studio 14",
        "price": 749990,
        "stock": 10,
        "special_index": 1,
        "category_index": 0,
        "brand_index": 1,
        "description": "Notebook liviano para trabajo remoto, presentaciones y demos.",
    },
    {
        "name": "Audífonos Nexo Air ANC",
        "price": 89990,
        "stock": 32,
        "special_index": 2,
        "category_index": 1,
        "brand_index": 3,
        "description": "Audífonos inalámbricos con cancelación activa de ruido.",
    },
    {
        "name": "Teclado Raven Pro TKL",
        "price": 69990,
        "stock": 28,
        "special_index": 0,
        "category_index": 2,
        "brand_index": 6,
        "description": "Teclado mecánico compacto para setups gaming y escritorios de desarrollo.",
    },
    {
        "name": "Monitor MiraView 27 4K",
        "price": 289990,
        "stock": 14,
        "special_index": 2,
        "category_index": 5,
        "brand_index": 7,
        "description": "Monitor 4K de 27 pulgadas para edición, streaming y trabajo diario.",
    },
    {
        "name": "Mouse Raven Vector",
        "price": 39990,
        "stock": 40,
        "special_index": 0,
        "category_index": 2,
        "brand_index": 6,
        "description": "Mouse liviano con sensor preciso y botones programables.",
    },
    {
        "name": "Parlante CasaNube 360",
        "price": 119990,
        "stock": 18,
        "special_index": 3,
        "category_index": 3,
        "brand_index": 5,
        "description": "Parlante inteligente para ambientes conectados, con sonido envolvente.",
    },
    {
        "name": "Dock USB-C CodeFusion 8 en 1",
        "price": 79990,
        "stock": 22,
        "special_index": 1,
        "category_index": 4,
        "brand_index": 0,
        "description": "Hub USB-C con puertos esenciales para notebooks modernos.",
    },
    {
        "name": "Power Bank Voltia 20K",
        "price": 44990,
        "stock": 35,
        "special_index": 0,
        "category_index": 4,
        "brand_index": 4,
        "description": "Batería externa de 20.000 mAh para viajes y jornadas largas.",
    },
    {
        "name": "Webcam PuntoPixel Full HD",
        "price": 54990,
        "stock": 30,
        "special_index": 1,
        "category_index": 5,
        "brand_index": 2,
        "description": "Webcam Full HD con micrófono integrado para reuniones y streaming.",
    },
    {
        "name": "SSD externo Andes 1TB",
        "price": 99990,
        "stock": 24,
        "special_index": 3,
        "category_index": 4,
        "brand_index": 1,
        "description": "Unidad SSD portátil para respaldos, proyectos y archivos pesados.",
    },
    {
        "name": "Ampolleta CasaNube Color",
        "price": 24990,
        "stock": 50,
        "special_index": 0,
        "category_index": 3,
        "brand_index": 5,
        "description": "Ampolleta LED inteligente con escenas de color y programación desde app.",
    },
    {
        "name": "Soporte Ruta Mobile MagSafe",
        "price": 29990,
        "stock": 38,
        "special_index": 2,
        "category_index": 4,
        "brand_index": 8,
        "description": "Soporte magnético para escritorio o auto, ideal para navegación y llamadas.",
    },
]

class CreateDB():

    def createBanners():
        print("Starting create banners")

        status = "selected"
        for index in range(1, 5):
            alt = f"{index}-Sample banner"
            if not Banner.objects.filter(alt=alt).exists():
                banner = Banner.objects.create(
                    status=status,
                    alt=alt
                )

                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/sampleBannerImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                
                with open("static-ecw/static/imgs/sampleBannerImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    banner.thumbnail.save(
                        f"sampleBannerImage_{index}.jpeg", File(buffer))

        print("Banners created successfully")

    def createSpecialCategories():

        print("Starting create special categories")

        specialCategories = []

        for index, name in enumerate(CATALOG_SPECIALS, start=1):
            slug = f"special-{index}"
            type = "special"

            if not Category.objects.filter(slug=slug, type=type).exists():
                category = Category.objects.create(
                    name=name,
                    slug=slug,
                    type=type
                )
                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/sampleCategoryImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                
                with open("static-ecw/static/imgs/sampleCategoryImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    category.icon.save(
                        f"sampleSpecialCategoryImage_{index}.jpeg", File(buffer))
            else:
                category = Category.objects.get(slug=slug, type=type)
            
            specialCategories.append(category)

        print("Special categories created successfully")
        
        return specialCategories

    def createCategories(specialCategories):

        print("Starting create categories")

        categories = []

        for index, category_data in enumerate(CATALOG_CATEGORIES, start=1):
            name = category_data["name"]
            slug = f"category-{index}"
            type = "category"

            if not Category.objects.filter(slug=slug, type=type).exists():
                category = Category.objects.create(
                    name=name,
                    slug=slug,
                    type=type
                )

                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/sampleCategoryImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                
                with open("static-ecw/static/imgs/sampleCategoryImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    category.icon.save(
                        f"sampleCategoryImage_{index}.jpeg", File(buffer))
            else:
                category = Category.objects.get(slug=slug, type=type)

            category.name = name
            category.type = type
            category.subcategories.add(specialCategories[category_data["special_index"]])
            category.save()
            categories.append(category)
        
        print("Categories created successfully")
        
        return categories
    
    def createBrands(categories):

        print("Starting create brands")

        brands = []

        for index, name in enumerate(CATALOG_BRANDS, start=1):
            slug = f"brand-{index}"
            type = "brand"

            if not Category.objects.filter(slug=slug, type=type).exists():
                brand = Category.objects.create(
                    name=name,
                    slug=slug,
                    type=type
                )

                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/sampleCategoryImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                
                with open("static-ecw/static/imgs/sampleCategoryImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    brand.icon.save(
                        f"sampleBrandImage_{index}.jpeg", File(buffer))
                    
                brand.save()
            else:
                brand = Category.objects.get(slug=slug, type=type)

            brand.name = name
            brand.type = type

            for c in categories:
                category = Category.objects.get(slug=c.slug)
                category.subcategories.add(brand)                

            brand.save()
            brands.append(brand)

        print("Brands created successfully")

        return brands
    
    def createProducts(specialCategories, categories, brands):

        print("Starting create products")

        for index, product_data in enumerate(CATALOG_PRODUCTS, start=1):
            name = product_data["name"]
            slug = f"product-{index}"
            price = product_data["price"]
            description = product_data["description"]
            stock = product_data["stock"]
            status = "on_sale"

            catalog_categories = [
                Category.objects.get(
                    slug=specialCategories[product_data["special_index"]].slug,
                    type=specialCategories[product_data["special_index"]].type,
                ),
                Category.objects.get(
                    slug=categories[product_data["category_index"]].slug,
                    type=categories[product_data["category_index"]].type,
                ),
                Category.objects.get(
                    slug=brands[product_data["brand_index"]].slug,
                    type=brands[product_data["brand_index"]].type,
                ),
            ]

            if not Product.objects.filter(slug=slug).exists():
                product = Product.objects.create(
                    name=name,
                    slug=slug,
                    price=price,
                    description=description,
                    stock=stock,
                    status=status
                )

                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/sampleImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                
                with open("static-ecw/static/imgs/sampleImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    product.thumbnail.save(
                        f"sampleProductImage_{index}.jpeg", File(buffer))
            else:
                product = Product.objects.get(slug=slug)
                product.name = name
                product.price = price
                product.description = description
                product.stock = stock
                product.status = status

            product.categories.set(catalog_categories)
            product.save()
        
        print("Products created successfully")

    def createBlogCategories():
        print("Starting create blog categories")

        blogCategories = []

        for index in range(1, 4):
            name = f"{index}-Sample blog category"
            slug = f"{index}-sample-blog-category"
            description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec magna magna. Suspendisse in maximus tortor. Sed ultricies feugiat ex. Etiam in interdum mauris. Donec vitae faucibus libero, vel cursus sapien. Fusce vel urna sed mi luctus auctor. Nulla facilisi. Ut sed scelerisque sem. Cras non metus turpis."

            if not BlogCategory.objects.filter(slug=slug).exists():
                blogCategory = BlogCategory.objects.create(
                    name=name,
                    slug=slug,
                    description=description
                )
                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/sampleCategoryImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                
                with open("static-ecw/static/imgs/sampleCategoryImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    blogCategory.icon.save(
                        f"sampleBlogCategoryImage{index}.jpeg", File(buffer))
            else:
                blogCategory = BlogCategory.objects.get(slug=slug)   

            blogCategories.append(blogCategory)

        print("Blog categories created successfully")

        return blogCategories  

    def createPosts(blogCategories, client_user):
        print("Starting create posts")

        def getContent(title, url):
            return f"<div class='flex column box-xxl margin-center gap-s margin-t-s third-color'> <h1>{title}<h1> <h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum molestie laoreet eros, eget pharetra enim vestibulum non. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque suscipit, justo ut feugiat tristique, nisi purus ultrices augue, at rhoncus elit urna vitae velit. Aliquam vitae ante convallis, consectetur diam vitae, egestas dolor. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent luctus laoreet justo, et tincidunt odio semper ut. Morbi faucibus vel diam ut efficitur. Aliquam vel hendrerit erat.</h4> <img class='box-xxl f-height-m fit-contain' src='{url}' alt='samplePostImage' /> </div>"        

        status = "active"
        description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec magna magna. Suspendisse in maximus tortor. Sed ultricies feugiat ex. Etiam in interdum mauris. Donec vitae faucibus libero, vel cursus sapien. Fusce vel urna sed mi luctus auctor. Nulla facilisi. Ut sed scelerisque sem. Cras non metus turpis."

        for index in range(1, 25):
            title = f"{index}-Sample post"
            slug = f"{index}-sample-post"

            categories = []

            category = random.choice(blogCategories)
            category = BlogCategory.objects.get(slug=category.slug)
            categories.append(category)

            if not Post.objects.filter(slug=slug).exists():
                post = Post.objects.create(
                    status=status,
                    description=description,
                    slug=slug,
                    title=title,
                    author=client_user
                )

                post.categories.set(categories)

                red = random.randint(0, 255)
                green = random.randint(0, 255)
                blue = random.randint(0, 255)
                width, height = Image.open(
                    "static-ecw/static/imgs/samplePostImage.jpeg").size
                solid_color_image = Image.new(
                    "RGB", (width, height), (red, green, blue))
                    
                with open("static-ecw/static/imgs/samplePostImage.jpeg", "rb") as img_file:
                    original_image = Image.open(img_file)
                    blended_image = Image.blend(
                        original_image, solid_color_image, alpha=0.5)
                    buffer = BytesIO()
                    blended_image.save(buffer, format="JPEG")
                    post.thumbnail.save(
                        f"samplePostImage_{index}.jpeg", File(buffer))  
                    
                url = f"{post.thumbnail.url}"
                post.content = getContent(title=title, url=url)   
                post.save() 

        print("Posts created successfully")

    def createSuperUser():

        print("Starting create superuser")

        username = env("SUPER_USERNAME")
        email = env("SUPER_EMAIL")
        password = env("SUPER_PASSWORD")
        if not User.objects.filter(email=email).exists():
            client_user = User.objects.create_superuser(
                username=username,
                email=email,
                first_name=username,
                last_name=username,
            )
            client_user.set_password(password)
            client_user.save()
        else:
            client_user = User.objects.get(email=email)

        print("Superuser created successfully")

        return client_user

    try:
        print("creating db")

        client_user = createSuperUser()

        createBanners()

        specialCategories = createSpecialCategories()
        categories = createCategories(specialCategories)
        brands = createBrands(categories)
        createProducts(specialCategories, categories, brands)

        blogCategories = createBlogCategories()
        createPosts(blogCategories, client_user)

        print("Db successfully")

    except Exception as e:
        print('Error: ', e)


if __name__ == '__main__':
    CreateDB()
