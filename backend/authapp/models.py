# backend/authapp/models.py
from django.db import models

class LoginCredential(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)

    class Meta:
        db_table = 'login_credentials'  # This matches your existing table
