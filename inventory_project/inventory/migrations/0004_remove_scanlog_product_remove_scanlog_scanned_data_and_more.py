# Generated by Django 5.2 on 2025-04-19 18:12

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0003_scanlog"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="scanlog",
            name="product",
        ),
        migrations.RemoveField(
            model_name="scanlog",
            name="scanned_data",
        ),
        migrations.RemoveField(
            model_name="scanlog",
            name="was_exact_match",
        ),
        migrations.AddField(
            model_name="scanlog",
            name="action",
            field=models.CharField(
                choices=[("scan", "Scanned"), ("add", "Added"), ("edit", "Edited")],
                default="scan",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="scanlog",
            name="barcode",
            field=models.CharField(default="unknown", max_length=50),
        ),
        migrations.AlterField(
            model_name="scanlog",
            name="timestamp",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
