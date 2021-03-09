'use strict';
const chai = require('chai');
const expect = require('chai').expect;
const assert = require('assert');

chai.use(require('chai-http'));

const app = require('../app');

describe('API Authentication endpoint /login', () => {
    after(function() {
        // process.exit();
    });
    it('should login', () => {
        return chai.request(app)
            .post('/api/v1/login?employeeNumber=123456&password=demo1&webApp=valora')
            .send({})
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object').that.include({success: true});
            });
    });

    describe('When collaborator has less than a year', () => {
        it('should not login to Valora', () => {
            return chai.request(app)
                .post('/api/v1/login?employeeNumber=123458&password=demo1&webApp=valora')
                .send({})
                .then(function(res) {
                    expect(res).to.have.status(401);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object').that.include({ success: false });
                }).catch(err => {});
        })
    })
});