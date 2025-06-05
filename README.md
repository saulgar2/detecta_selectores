# detecta_selectores

Programa en Python que obtiene todos los selectores CSS presentes en una 
página web.

## Uso

```
python -m detecta_selectores <URL>
```

Tambien puede utilizarse con rutas locales usando el esquema `file://`.

## Desarrollo

Incluye pruebas automáticas que pueden ejecutarse con:

```
python -m unittest
```

## Extensión de Chrome

La carpeta `chrome_extension/` contiene una implementación básica de la
extensión para Google Chrome. Para cargarla en modo de desarrollo:

1. Abrir `chrome://extensions/` en el navegador.
2. Activar **Modo de desarrollador**.
3. Pulsar **Cargar descomprimida** y seleccionar la carpeta `chrome_extension`.
4. Hacer clic en el icono *Detecta Selectores* e introducir la URL y el tipo de
   proyecto.
5. Presionar **Crear proyecto** y elegir la carpeta de destino cuando se le
   solicite.

Se generará la estructura del proyecto en la carpeta seleccionada y se mostrará
un mensaje con el nombre de dicha carpeta.

