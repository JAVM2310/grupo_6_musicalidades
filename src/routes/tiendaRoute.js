const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const adminMiddleware = require('../middlewares/adminMiddleware.js');
const validacionProductos = require("../middlewares/validacionProductosBack.js")
const validacionModificarProductos = require("../middlewares/validacionModificarProductosBack.js")


/************************** MULTER **************************/

const storage = multer.diskStorage ({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/img/products'));
    },
    filename: (req, file, cb) => {
        const nameImgProduct = 'producto-' + Date.now() + path.extname(file.originalname);
        cb(null, nameImgProduct);
    }
});



const upload = multer({storage});

/********* VALIDACION IMAGENES MULTER ********/

/* const upload = multer({storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
        } else {
        cb(null, false);
        return res.render(new Error('Only .png, .jpg and .jpeg format allowed!');
        }
    }
}); */



/************************** CONTROLLERS **************************/

const tiendaController = require ('../controllers/tiendaController');



/************************** ROUTES **************************/

router.get('/', tiendaController.tienda);
router.get('/productDetail/:id', tiendaController.productDetail);
router.get('/productCart', tiendaController.productCart);
router.get("/newProduct", adminMiddleware, tiendaController.newProduct);
router.post("/newProduct", upload.array('images'), validacionProductos, tiendaController.createProduct);
router.get("/modifyProduct/:id", adminMiddleware, tiendaController.modifyProduct);
router.put("/productDetail/:id", adminMiddleware, upload.array('images'), validacionModificarProductos, tiendaController.modify)
router.get("/deleteProduct/:id", adminMiddleware, tiendaController.delete)



module.exports = router;