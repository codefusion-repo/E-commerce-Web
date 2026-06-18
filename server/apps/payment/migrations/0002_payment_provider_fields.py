# Generated manually for payment provider sandbox hardening.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("payment", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="provider_payment_id",
            field=models.CharField(blank=True, db_index=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="payment",
            name="provider_order_id",
            field=models.CharField(blank=True, db_index=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="payment",
            name="status",
            field=models.CharField(default="pending", max_length=50),
        ),
        migrations.AddIndex(
            model_name="payment",
            index=models.Index(fields=["purchase", "method"], name="payment_purchase_method_idx"),
        ),
    ]
