
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/basic/", include("Basic.urls")),
    path("api/raster_visual/",include("raster_visual.urls")),
    path("api/mapplot/", include("mapplot.urls")),
    path("api/gwa/", include("gwa.urls")), 
    path("api/stp_suitability/", include("stp_suitability.urls")),
    path("api/auth/", include("authapp.urls")),
]
