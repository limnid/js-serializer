# JSerializer

**Install and Build**
```$xslt
npm install 
npm run build
```

**Run test**
```$xslt
npm run test
```

**Example**
```$xslt
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
    
    const result = userSchema.toObject();
    const errors = userSchema.getErrors();
```