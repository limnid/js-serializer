const Marshmallow = function(rules) {
    let validationErrors = null;
    let virtualRules = {};
    let results = {};

    const clone = function(obj) {
        if (null === obj || "object" !== typeof obj) return obj;
        let copy = obj.constructor();
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    };

    const isEmpty = function (obj) {
        for(let prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    };

    /**
     * Set default options
     */
    const optionAssign = function(options) {
        return Object.assign({
            optional: true,
            virtual: false,
            validation: {
                required: false,
                callbackMessage: '',
                callback: false
            },
            getter: function(value) {},
            setter: function(value) {}
        }, options);
    };

    return {
        load: function(data) {
            let errors = {};
            let result = {};

            rules = Object.assign(virtualRules, rules);

            /**
             * Set rules
             */
            for (let key in rules) {
                if (typeof rules[key] === 'function') {
                    // Apply rule for primitive types
                    let primitiveType = typeof rules[key]();
                    if (primitiveType === 'number') {
                        result[key] = parseInt(data[key]);
                    } else if (primitiveType === 'string') {
                        result[key] = data[key] + '';
                    } else if (primitiveType === 'object') {
                        result[key] = data[key];
                    }
                    continue;
                }

                if (rules[key].length) {
                    // Nested Array of Objects
                    if (!data[key] || !data[key].length) continue;

                    result[key] = [];
                    errors[key] = [];
                    data[key].map(function(item, i) {
                        let objectResult = rules[key][0].load(data[key][i]);
                        result[key][i] = objectResult[0];

                        // Set errors
                        if (objectResult[1]) {
                            errors[key][i] = objectResult[1];
                        }
                    });

                    if (errors[key].length <= 0) {
                        delete errors[key];
                    }

                    continue;
                } else if (rules[key].load && typeof rules[key].load === 'function') {
                    // Nested Object
                    let valueExists = data.hasOwnProperty(key);
                    if (valueExists) {
                        let objectResult = rules[key].load(data[key]);
                        result[key] = objectResult[0];

                        // Set errors
                        if (objectResult[1]) {
                            errors[key] = objectResult[1];
                        }
                    }
                    continue;
                }

                // Apply rule
                let rule = optionAssign(rules[key]);
                let valueExists = data ? data.hasOwnProperty(key) : false;

                if (rule.virtual) {
                    if (rule.getter) result[key] = rule.getter.call(data);
                } else if (valueExists) {
                    if (rule.getter) result[key] = rule.getter(data[key]);
                } else {
                    // (!rules[key])
                    result[key] = null;
                }

                // Validate
                if (rule.validation.required && !result[key]) {
                    errors[key] = 'is required';
                }

                if (rule.validation.callback && !rule.validation.callback(result[key])) {
                    errors[key] = rule.validation.callbackMessage;
                }
            }

            errors = !isEmpty(errors) ? errors : null;
            validationErrors = errors;
            results = result;

            return [result, errors];
        },
        virtual: function(name, rule) {
            rule['virtual'] = true;
            virtualRules[name] = rule;
        },
        getErrors: function() {
            return validationErrors;
        },
        toJson: function() {
            return JSON.stringify(results, null, 2);
        },
        toObject: function() {
            return results;
        }
    };
};

module.exports = Marshmallow;
