const { body } = require("express-validator");
const fs = require("fs");

module.exports = [
    

/*     body('categoria').notEmpty().withMessage('Debes elegir una categoría'),
 */ /* body('marcaNuevaNombre').notEmpty().withMessage('Debes ingresar el Nombre de la Nueva Marca.').bail().isLength({ min: 2, max: 15 }).withMessage('El Nombre de la nueva Marca debe tener entre 2 y 15 caracteres'), */
    body('name').notEmpty().withMessage('Debes completar el Nombre del Producto').bail().isLength({ min: 10, max: 28 }).withMessage('El Nombre del Producto debe tener entre 10 y 28 caracteres'),
    body('shortDesc').notEmpty().withMessage('Debes completar la Breve Descripción').bail().isLength({ min: 20, max: 60 }).withMessage('La Breve Descripción debe tener entre 20 y 60 caracteres'),
    body('longDesc').notEmpty().withMessage('Debes completar la Descripción Detallada').bail().isLength({ min: 200 }).withMessage('La Descripción Detallada debe tener más de 200 caracteres'),
    body('price').notEmpty().withMessage('Debes completar el Precio').bail().isFloat({ min: 1}).withMessage('El Precio debe ser mayor a 0'),
    body('discount').notEmpty().withMessage('Debes completar el % de Descuento').bail().isInt({ min: 0, max: 100 }).withMessage('El % de Descuento debe ser un número entre 0 y 100'),
    body('stock').notEmpty().withMessage('Debes completar el Stock').bail().isInt({ min: 1}).withMessage('El Stock debe ser mayor a 0'),
    body('marcaNuevaNombre').custom((value, { req }) => {
        if (value == "" && req.body.marcaNueva == 1) {
            throw new Error("Adjunte una image con formato")
        }else{
            return true;
        }
    }), 

    /* body('marcaNuevaNombre').custom((value, { body }) => {
        
        console.log(body.marcaNueva)
        
        if (value == "" && body.marcaNueva.value == 1) {
            throw new Error("Adjunte una image con formato")
        }
    }),*/
    
   
    /*
    body('marcaNuevaNombre').custom(value => {
        if (value == "" && body('marcaNueva') == 1) {
            throw new Error('Debes ingresar el Nombre de la Nueva Marca.');
        }
        return true;
    })
    */



    body('categoria').custom(value => {
        if (value == 5) {
            throw new Error('Debes elegir una Categoría.');
        }
        return true;
    }),
    body('marca').custom(value => {
        if (value == "seleccionar") {
            throw new Error('Debes elegir una Marca.');
        }
        return true;
    }),

    body('images').custom((value, {req}) => {
        let files = req.files

        let extensionesAceptadas = [".jpg", ".png", ".gif", ".jpeg"]
        if(files != []){
            for (let i = 0; i < files.length; i++) {
                let f = files[i];
                let okFile;
                for (let n = 0; n < extensionesAceptadas.length; n++){
                    let ext = extensionesAceptadas[n];
                    console.log(f)
                    if(f.originalname.includes(ext)){
                        okFile = "ok";
                    }
                }
                if(okFile != "ok"){
                    throw new Error("Debe subir al menos una imagen de tipo " + extensionesAceptadas) 
                }else{
                    return true;
                }
            }
        }else{
            throw new Error("Debe subir al menos una imagen")
        }
    }),



    
]