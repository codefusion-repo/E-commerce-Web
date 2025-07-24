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

        for index in range(1, 5):
            name = f"{index}-Sample special category"
            slug = f"{index}-sample-special-category"
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

        for sc in specialCategories:
            for index in range(1, 7):
                name = f"{sc.name[0:2]}{index}-Sample category"
                slug = f"{sc.name[0:2]}{index}-sample-category"
                type = "category"

                if not Category.objects.filter(slug=slug, type=type).exists():
                    category = Category.objects.create(
                        name=name,
                        slug=slug,
                        type=type
                    )

                    category.subcategories.add(sc)

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
                        
                    category.save()
                else:
                    category = Category.objects.get(slug=slug, type=type)
                
                categories.append(category)
        
        print("Categories created successfully")
        
        return categories
    
    def createBrands(categories):

        print("Starting create brands")

        brands = []

        for index in range(1, 14) :
            name = f"{index}-Sample brand"
            slug = f"{index}-sample-brand"
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

            for c in categories:
                category = Category.objects.get(slug=c.slug)
                category.subcategories.add(brand)                

            brands.append(brand)

        print("Brands created successfully")

        return brands
    
    def createProducts(specialCategories, categories, brands):

        print("Starting create products")

        for index in range(1, 80):
            name = f"{index}-Sample product"
            slug = f"{index}-sample-product"

            price = random.randint(2500, 50000)

            description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec magna magna. Suspendisse in maximus tortor. Sed ultricies feugiat ex. Etiam in interdum mauris. Donec vitae faucibus libero, vel cursus sapien. Fusce vel urna sed mi luctus auctor. Nulla facilisi. Ut sed scelerisque sem. Cras non metus turpis."

            stock = random.randint(5, 25)
            status = "on_sale"

            c = []

            specialCategory = random.choice(specialCategories)
            specialCategory = Category.objects.get(slug=specialCategory.slug, type=specialCategory.type)
            c.append(specialCategory)
            category = random.choice(categories)
            category = Category.objects.get(slug=category.slug, type=category.type)
            c.append(category)
            brand = random.choice(brands)
            brand = Category.objects.get(slug=brand.slug, type=brand.type)
            c.append(brand)

            if not Product.objects.filter(slug=slug).exists():
                product = Product.objects.create(
                    name=name,
                    slug=slug,
                    price=price,
                    description=description,
                    stock=stock,
                    status=status
                )
                product.categories.set(c)

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