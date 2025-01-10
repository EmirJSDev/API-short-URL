const request = require('supertest');
const app = require('../src/server');
const { expect } = require('chai');

describe('URL Shortener API', () => {
    let shortUrl;

    it('should shorten a URL', (done) => {
        request(app)
            .post('/')
            .send({ originalUrl: 'http://example.com' })
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                shortUrl = res.body.shortUrl;
                expect(shortUrl).to.match(/\/[a-z0-9]{6}$/);
                done();
            });
    });

    it('should redirect to the original URL', (done) => {
        const shortCode = shortUrl.split('/').pop();
        request(app)
            .get(`/${shortCode}`)
            .expect(302)
            .expect('Location', 'http://example.com')
            .end(done);
    });

    it('should return URL info', (done) => {
        const shortCode = shortUrl.split('/').pop();
        request(app)
            .get(`/info/${shortCode}`)
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.property('originalUrl').equal('http://example.com');
                expect(res.body).to.have.property('clickCount').equal(1);
            })
            .end(done);
    });

    it('should return URL analytics', (done) => {
        const shortCode = shortUrl.split('/').pop();
        request(app)
            .get(`/analytics/${shortCode}`) // Убедитесь, что адрес правильный
            .expect(200)
            .expect((res) => {
                expect(res.body).to.have.property('shortUrl').equal(`/${shortCode}`);
                expect(res.body).to.have.property('clickCount').equal(1);
                expect(res.body).to.have.property('latestClicks').to.be.an('array');
            })
            .end(done);
    });

    it('should delete a short URL', (done) => {
        const shortCode = shortUrl.split('/').pop();
        request(app)
            .delete(`/${shortCode}`)
            .expect(200)
            .end(done);
    });
});