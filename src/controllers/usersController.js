const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require("fs");
let bcrypt = require('bcryptjs');
const multer = require('multer');

const { validationResult } = require("express-validator")


const db = require("../database/models/index")
const Sequelize = require('sequelize');
//const { isColString } = require('sequelize/types/utils');
const Op = Sequelize.Op;

const validacionRegistroMiddleware = require("../middlewares/validacionRegistroBack")

const usersFilePath = path.join(__dirname, '../database/users.json');
let error = '';


const controller = {

    login: (req, res) => {
        let titulo = "Login"
        res.render('./users/login', {titulo: titulo, error});
    },

    register: (req, res) => {
        res.render('./users/register', {titulo: "Registro", error});
    },

    logueado: (req, res) => {
        const resultValidation = validationResult(req);
        console.log(resultValidation);
        db.Usuario.findOne({
            where: {
                email: req.body.email,
            }
        })
        .then(function(resultado){

            if (resultValidation.errors.length > 0) {
                console.log("entré")
                return res.render('./users/login', {titulo: 'login', error, errors: resultValidation.mapped(), old: req.body});
            }

            if (resultado == null){
                let error = "No existe el Usuario";
                return res.render('./users/login', {titulo: 'login', error, errors: resultValidation.mapped()});
            }
            if (!bcrypt.compareSync(req.body.password, resultado.dataValues.password)){
                let error = "La contraseña no es correcta";
                return res.render('./users/login', {titulo: 'login', error, errors: resultValidation.mapped()});
            }

            delete resultado.dataValues.password;
            req.session.usuariosLogueado = resultado.dataValues;

            return res.redirect('/'); 

        })

    },
    crearUsuario: (req, res) => {
        
        console.log(req.body);

        const error =  validationResult(req);
        console.log(error.array());

        if (error.array().length > 0){
            console.log("hay errores");
            console.log(error.array());
            return res.render('./users/register', {titulo: "Registro", error: error.array()});
        } else {
            console.log("no hay errores");
            db.Usuario.findOne({
                where: {
                    email: req.body.email,
                }
            })
            .then(function(resultado){
                if (resultado){
                    /* const error = "Ese mail ya está registrado" */
                    return res.render('./users/register', {titulo: "Registro", error: []});
                }else{
                    let nombreImagen = '';
                    if(req.file != undefined){
                        nombreImagen = '/users/' + req.file.filename;
                    }else{
                        nombreImagen = '/users/default.png';
                    }
                    db.Usuario.create({
                        nombre: req.body.nombre,
                        apellido: req.body.apellido,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, 10),
                        pais: req.body.pais,
                        provincia: req.body.provincia,
                        ciudad: req.body.ciudad,
                        direccion: req.body.direccion,
                        codPostal: req.body.codigo,
                        fechaNac: req.body.fechaNac,
                        avatar: nombreImagen,
                        permisos: 0
                    })
                    return res.redirect("/login");
                }
            })
        }
    },

    checkearDisponibilidad:(req, res)=> {
        console.log("check");
        mail = req.params.email
        db.Usuario.findOne({
            where:{
                email: mail
            }
        })
        .then((result)=>{
            if (result == null){
                return res.json(true)
            } else {
                return res.json(false)
            }
        })
    },

    signOut: (req, res) => {
        delete req.session.usuariosLogueado
        res.redirect("/")
    },

    profile: (req, res) => {
        db.Usuario.findOne({
            where: {
                id: req.session.usuariosLogueado.id,
            }
        })
        .then(function(usuario){
            res.render('./users/myprofile', {titulo: "Perfil", user: usuario.dataValues});
        })
    },

    modifyUser: (req, res) => {//ESTE ESTÁ OK, HAY QUE RETOCAR LA VISTA PARA QUE QUEDE MÁS BELLA
        
        db.Usuario.findByPk(req.params.id)
        .then((usuario) =>{
            let error = ""
            res.render('./users/modifyuser', {titulo: "Editar Usuario", user: usuario.dataValues, error});
        })

    },

    profileEdition: (req, res) => {// ESTE ESTÁ OK

        const error = validationResult(req)

        console.log(error.array());

        let avatar = "";
        db.Usuario.findOne({
            where: {
                id: req.params.id,
            }
        })
        .then((resultado)=>{
            avatar = resultado.dataValues.avatar;
            if(resultado.dataValues.email != req.body.email){
                db.Usuario.findOne({
                    where: {
                        email: req.body.email,
                    }
                }).then((resultado)=>{
                    if(resultado != null){
                        let error = "El email " + resultado.dataValues.email + " ya existe. Debe elegir otro email";
                        return res.render('./users/modifyuser', {titulo: 'Editar Usuario', user: req.session.usuariosLogueado, error});
                    }else{
                        if(req.file){
                            fs.unlink(path.join(__dirname, "../../public/img/") + avatar, log => console.log("Se borró el archivo: " + avatar + " en la carpeta: " + path.join(__dirname, "../../public/img/users/")))
                            avatar = '/users/' + req.file.filename;
                        }
                        db.Usuario.update({
                            nombre: req.body.nombre,
                            apellido: req.body.apellido,
                            email: req.body.email,
                            pais: req.body.pais,
                            provincia: req.body.provincia,
                            ciudad: req.body.ciudad,
                            codPostal: req.body.codPostal,
                            fechaNac: req.body.fechaNac,
                            avatar: avatar
                        },
                        {
                            where:{
                                id: req.params.id
                            }
                        })
                        .then(()=>{
                            //res.render("users/myprofile", {titulo: "Perfil", user: req.session.usuariosLogueado});
                            res.redirect("/myprofile");
                        })
                    }
                })
            }else{
                if(req.file){
                    fs.unlink(path.join(__dirname, "../../public/img/") + avatar, log => console.log("Se borró el archivo: " + avatar + " en la carpeta: " + path.join(__dirname, "../../public/img/users/")))
                    avatar = '/users/' + req.file.filename;
                }
                db.Usuario.update({
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    email: req.body.email,
                    pais: req.body.pais,
                    provincia: req.body.provincia,
                    ciudad: req.body.ciudad,
                    codPostal: req.body.codPostal,
                    fechaNac: req.body.fechaNac,
                    avatar: avatar
                },
                {
                    where:{
                        id: req.params.id
                    }
                })
                .then(()=>{
                    //res.render("users/myprofile", {titulo: "Perfil", user: req.session.usuariosLogueado});
                    res.redirect("/myprofile");
                })
            }
        })
    },
    delete(req, res){//ESTE ESTÁ OK
        let user = req.session.usuariosLogueado;
        
        db.Usuario.destroy({
                where:{
                    id: user.id
                }
        })
        .then(()=>{
            delete req.session.usuariosLogueado;
            res.redirect("/")
        })
    },
};



module.exports = controller;