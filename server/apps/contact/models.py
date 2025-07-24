from django.db import models
import uuid

class Message(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    class Meta:
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes" 

    email = models.CharField(max_length=155)
    name = models.CharField(max_length=155)

    message = models.TextField(max_length=1200)
    def __str__(self):
        return f'Mensaje {self.email}.'
    
class Newsletter(models.Model):
    id = models.CharField(max_length=300, primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    class Meta:
        verbose_name = "newsletter"
        verbose_name_plural = "newsletters" 

    email = models.CharField(max_length=155)
    def __str__(self):
        return f'Usuario del newesletter {self.email}.'