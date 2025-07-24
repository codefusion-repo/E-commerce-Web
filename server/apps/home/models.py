from django.db import models
import uuid

def banner_directory(instance, filename):
    return 'banners/{0}/{1}'.format(instance.alt, filename)

class Banner(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    class Meta:
        verbose_name = "Banner"
        verbose_name_plural = "Banners" 

    class SelectedObjects(models.Manager):
        def get_queryset(self):
            return super().get_queryset().filter(status='selected')
        
    banner_status = [
        ('not_selected', 'not_selected'),
        ('selected', 'selected'),
    ]
    status = models.CharField(max_length=255, choices=banner_status)
    thumbnail = models.ImageField(upload_to=banner_directory, blank=False, null=False)
    alt = models.CharField(max_length=255)

    objects = models.Manager()
    selectedObjects = SelectedObjects()
    
    def __str__(self):
        return f'Banner {self.alt}.'
