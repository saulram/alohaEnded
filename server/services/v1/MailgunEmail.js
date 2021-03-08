/**
 * Created by Latin on 3/22/2017.
 */
'use strict';
const config = require('../../config/configuration'),
    mailgun = require('mailgun-js')({apiKey: config.staging.api_key, domain: 'sandbox9b7c437a8cc54e199de2e912d73ff446.mailgun.org'}),
    mailcomposer = require('mailcomposer');

exports.send = function (email, subject, html) {
    // plunker: https://plnkr.co/edit/fy31n6PACKn1c8oU5HIZ?p=preview
    let htmlLayout =
        "<!DOCTYPE html>" +
        "<html xmlns='http://www.w3.org/1999/xhtml'>" +
            "<head>" +
                "<meta charset='utf-8'>" +
                "<meta name='x-apple-disable-message-reformatting'>" +
                "<title>Valora</title>" +
            "</head>" +
        "<body width='100%' bgcolor='#ffffff' style='margin: 0; mso-line-height-rule: exactly;'>" +
            "<table width='100%' bgcolor='#ffffff' cellpadding='0' cellspacing='0' border='0'>" +
                "<tbody>" +
                    "<tr>" +
                        "<td>" +
                            "<table width='600' align='left' border='0' cellpadding='10px' cellspacing='0' class='devicewidth'>" +
                                "<tbody>" +
                                    "<tr>" +
                                        "<td width='50' height='40' align='center'>" +
                                            "<div class='imgpop'>" +
                                                "<a target='_blank' href='https://valora-gp.com/'>" +
                                                    "<img src='https://valora-gp.com/assets/images/logo-valora-icono.png' alt='' border='0' width='50' height='40' style='display:block; border:none; outline:none; text-decoration:none;'>" +
                                                "</a>" +
                                            "</div>" +
                                        "</td>" +
                                        "<td align='center' style='font-family: Helvetica, arial, sans-serif; font-size: 18px;color: #c689ff' height='45'></td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>" +
                            "<table width='600' align='left' border='0' cellpadding='12px' cellspacing='0' class='devicewidth' style='font-family: Helvetica, arial, sans-serif; font-size: 12px;'>" +
                                "<tbody>" +
                                    "<tr>" +
                                        "<td>" +
                                            "<p>¡Hola! Te enviamos tu actividad en Valora el día de hoy:</p>" +
                                            html +
                                        "</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>" +
                            "<table width='600' align='left' border='0' cellpadding='5px' cellspacing='0' class='devicewidth' style='background-color: #686868; color: #FFFFFF; font-family: Helvetica, arial, sans-serif; font-size: 12px;'>" +
                                "<tbody>" +
                                    "<tr>" +
                                        "<td><p style='margin-left: 6px'>*</p></td>" +
                                        "<td>" +
                                            "<p>Este correo es informativo, favor no responder a esta dirección de correo, ya que no se encuentra habilitada para recibir mensajes.</p>" +
                                        "</td>" +
                                    "</tr>" +
                                    "<tr>" +
                                        "<td><p style='margin-left: 6px'>*</p></td>" +
                                        "<td>" +
                                            "<p>Recuerda que para poder editar estas notificaciones, puedes activarlas o desactivarlas en el panel de preferencias dentro de Valora, en el menú superior del lado derecho.</p>" +
                                        "</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "</td>" +
                    "</tr>" +
                "</tbody>" +
            "</table>" +
        "</body>" +
        "</html>";

    let mailData = mailcomposer({
        from: 'soporte-tecnico@valora-gp.com',
        to: email,
        subject: subject,
        text: '',
        html: htmlLayout
    });

    mailData.build(function (error, message) {
        const sendTo = {
            to: email,
            message: message.toString('ascii')
        };

        try {
            mailgun.messages().sendMime(sendTo, function (sendError, body) {
                if (sendError) {
                    console.error(sendError);
                }
                else {
                    console.log('Email send correctly.');
                }
            });
        }
        catch(exception) {
            console.log('Error at sending mail. ' + exception);
        }
    })
};