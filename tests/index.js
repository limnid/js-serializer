const { describe, it } = require('mocha');
const assert = require('assert');
const Marshmallow = require('../src/marshmallow');

describe('Serializer', function() {
    const profileSchema = new Marshmallow({
        email: {
            validation: {
                required: true,
                callbackMessage: 'Error',
                callback: function(value) {
                    return true;
                }
            },
            getter: function(value) {
                return value;
            }
        }
    });

    const userSchema = new Marshmallow({
        name: {
            validation: {
                required: true,
                callback: function(value) {
                    return true;
                }
            },
            getter: function(value) {
                return value + '!';
            }
        },
        age: Number,
        profile: profileSchema,
        profiles: [profileSchema]
    });

    userSchema.virtual('custom', {
        getter: function() {
            return this.name + ': Custom value';
        }
    });

    userSchema.load({
        name: 'Test user',
        age: 1,
        profile: {
            email: 'admin@test.com'
        },
        profiles: [{
            email: 'admin@test.com'
        },{
            email: 'admin@test.com'
        },{
            email: 'admin@test.com'
        }]
    });

    it('should have a profile\n', (done) => {
        const result = userSchema.toObject();
        assert.ok("profiles" in result);
        assert.ok(result["profiles"].length);
        done();
    });

    it('shouldn\'t have errors\n', (done) => {
        assert.equal(userSchema.getErrors(), null);
        done();
    });

    it('shouldn\'t have a custom value\n', (done) => {
        const result = userSchema.toObject();
        assert.ok(result.custom);
        done();
    });
});
