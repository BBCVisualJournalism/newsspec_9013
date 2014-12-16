define(['lib/news_special/bootstrap', 'data', 'lib/vendors/jquery.autocomplete'], function (news, DataModel) {

    'use strict';

    var CountryAutocomplete = function (el, callback) {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = el;
        this.callback = callback;
        this.selectedCountry = null;
        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    CountryAutocomplete.prototype = {

        init: function () {
            var self = this;

            var searchSuggestionArray = [];
            $.each(DataModel, function (countryCode, country) {

                country.countryCode = countryCode;

                var suggestion = {
                    value: country.name,
                    country: country
                };
                searchSuggestionArray.push(suggestion);

                if (countryCode === 'GBR') {
                    self.setCountry(suggestion.country);
                }
            });

            this.el.autocomplete({
                lookup: searchSuggestionArray,
                lookupFilter: self.filterSearchResults,
                autoSelectFirst: true,
                lookupLimit: 10,
                onSelect: self.onCountrySelect.bind(this)
            });
        },

        filterSearchResults: function (suggestion, query, queryLowerCase) {
            var matchFound = false;
            if (suggestion.country.otherNames) {
                for (var i = 0; i < suggestion.country.otherNames.length; i++) {
                    var otherName = suggestion.country.otherNames[i];
                    if (otherName.toLowerCase().indexOf(queryLowerCase) !== -1) {
                        matchFound = true;
                        break;
                    }
                }
            }

            return matchFound || suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
        },

        onCountrySelect: function (suggestion) {
            this.setCountry(suggestion.country);
            if (this.callback) {
                this.callback(suggestion.country);
            }
        },

        getUserInput: function () {
            var testRegEx = new RegExp(/^0|\d+$/);

            var beerText = parseFloat($('#beerInput').val(), 10),
                wineText = parseFloat($('#wineInput').val(), 10),
                spiritsText = parseFloat($('#spiritsInput').val(), 10);

            if (!isNaN(beerText) && !isNaN(wineText) && !isNaN(spiritsText)) {
                if (beerText >= 0 && wineText >= 0 && spiritsText >= 0) {
                    return {
                        beers: beerText,
                        wines: wineText,
                        spirits: spiritsText
                    };
                }
            }
            return false;
        },

        setCountry: function (country) {
            this.el.val(country.name);
            this.selectedCountry = country;
        },

        getSelectedCountry: function () {
            return (this.selectedCountry.name === this.el.val()) ? this.selectedCountry : false;
        }
    };

    return CountryAutocomplete;

});