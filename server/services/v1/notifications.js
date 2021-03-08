'use strict';

const mongoose = require('mongoose'),
    Notification = mongoose.model('Notification');

exports.newNotification = (feed, comment) => {
    return new Promise((resolve, reject) => {
        const notificationData = {
            feed_id: feed._id,
            receiver_id: feed.receiver_id,
            content: '',
            type: feed.type
        };

        if(typeof feed.sender_id !== 'undefined') {
            notificationData.sender_id = feed.sender_id;
        }

        if(feed.type === 'ambassador' && typeof comment === 'undefined') {
            notificationData.message = 'Has obtenido una embajada:';
            notificationData.content = feed.receiverName + ' de ' + feed.receiverLocation + ' obtuvo una embajada. Gracias al reconocimiento de todos en Grupo Presidente. ¡Disfruta del trono que pronto te pueden desbancar!';
        } else if(feed.type === 'badge' && typeof comment === 'undefined') {
            notificationData.message = 'Has otorgado o recibido una insignia:';
            notificationData.content = feed.receiverName + ' de ' + feed.receiverLocation + ' ha recibido una insignia de parte de ' + feed.senderName;
        } else if(feed.type === 'Reward exchanged' && typeof comment === 'undefined') {
            notificationData.message = 'Has canjeado una recompensa:';
            notificationData.content = feed.receiverName + ' de ' + feed.receiverLocation + ' acaba de canjear una recompensa: ' + feed.rewardName + ' con valor de ' + feed.rewardPoints + ' pts ¡Tu esfuerzo se ha visto recompensado!'
        } else if(feed.type === 'GP badge' && typeof comment === 'undefined') {
            notificationData.message = 'Has otorgado o recibido una insignia:';
            notificationData.content = feed.receiverName + ' de ' + feed.receiverLocation + ' ha recibido una insignia de parte de Grupo Presidente';
        } else if(typeof comment !== 'undefined') {
            if(comment.type === 'tagged') {
                notificationData.message = 'Te han etiquetado en un comentario:';
            } else {
                notificationData.message = 'Han comentado un post relacionado contigo:';
            }

            notificationData.content = comment.collaborator.completeName + ': ' + comment.message;
        } else if(feed.type === 'like') {
            notificationData.message = 'Has recibido un me gusta en un post relacionado contigo:';
            notificationData.content = 'A ' + feed.receiverName + ' le gusta tu actividad';
        }

        const notification = new Notification(notificationData);
        notification.save(function(err, doc) {
            if(err) {
                console.error('notification service - Create notification. ' + err);
                reject(false);
            } else {
                resolve(true);
            }
        });
    })
};