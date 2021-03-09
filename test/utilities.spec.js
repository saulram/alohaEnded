'use strict';
const chai = require('chai');
const expect = require('chai').expect;
const assert = require('assert');
const config = require('../server/config/configuration'),
    utilities = require('../server/services/v1/Helpers'),
    feedCtrl = require('../server/controllers/v1/FeedsCtrl'),
    notifications = require('../server/services/v1/notifications');

describe('Validates the helper functions', () => {
    let upgrade;

    before(() => {
        upgrade = {
            points: 100,
            result: 140,
            badge: 'Plata'
        }
    });

    after(function() {
        //process.exit();
    });

    describe('Method returns the Upgrade badge', () => {
        it('Should return the Upgrade badge depending of the result value', () => {
            const upgradeBadge = utilities.getUpgradeBadge(upgrade).badgeName;
            assert(upgradeBadge === 'Plata');
        })
    });

    describe('Variables that define the format when the cron job is executed', () => {
        it('Should execute this cron once a month, format: 0 0 1 * *', () => {
            const cronFormat = config.development.renewTemporalPtsCron;
            assert(cronFormat === '0 0 1 * *');
        })
    });

    describe('Validates that the generated date is initialized in 0', () => {
        it('Should return the time zone in 0', () => {
            const date = utilities.newDate('2018-11-01T06:00:00.000Z');
            assert(date.toISOString().split('T')[1] === '00:00:00.000Z');
        })
    })
});

describe('Validate acknowledgments', () => {
    let feedData;

    after(function() {
    });

    describe('Method should create a feed document for badge acknowledgment', () => {
        it('Should return success', () => {
            const myPromise = feedCtrl.createBadgeAcknowledgment('honestidad-e-integridad', '', '59ee1ef4d5933e7d330ee3f4',
                'MA MARCELA NICANDRA TRENADO DUARTE', '58b991f8a0345b3e50df1cae', 'JOSÉ MIGUEL RAMÍREZ MARTÍNEZ',
                'Document creation for badge acknowledgment', 'badge');
            myPromise.then(success => {
                assert(success);
            });
        });

        it('Should return success when a ambassador feed is created', () => {
            const myPromise = feedCtrl.createBadgeAcknowledgment('honestidad-e-integridad', 'ambassador', '59ee1ef4d5933e7d330ee3f4',
                'MA MARCELA NICANDRA TRENADO DUARTE', '', '', '', 'ambassador');
            myPromise.then(success => {
                assert(success);
            });
        })
    });
});

describe('Validate notifications', () => {
    after(function() {
        process.exit();
    });

    describe('Method should create a notification document', () => {
        it('Should return success when someone comments a related post', () => {
            const feed = {
                _id: '5b2299fbf038c718d90045ad',
                type: 'Reward exchanged',
                reward_id: '5ab288758c19ec0af52764aa',
                rewardName: 'Set de herramientas',
                receiver_id: '58b991f8a0345b3e50df1cae',
                receiverName: 'JOSÉ MIGUEL RAMÍREZ MARTÍNEZ',
                rewardImage: 'fed55df39172e2191745da0da32edf5e',
                rewardPoints: 2000,
                receiverLocation: 'CORPORATIVO',
                comments: [],
                isActive: true,
                likes: {
                    collaborator_id: [],
                    count: 0
                }
            };
            const comment = {
                collaborator: { id: '5899f2400b907a809694e50e', completeName: 'MABEL BELLO SALMERÓN' },
                message: 'Si que te hace falta'
            };

            const myPromise = notifications.newNotification(feed, comment);
            myPromise.then(success => {
                assert(success);
            });
        });
    });
});