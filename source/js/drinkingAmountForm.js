define(['lib/news_special/bootstrap', 'data', 'lib/vendors/jquery.autocomplete'], function (news, DataModel) {

    'use strict';

    var DrinkingAmountForm = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.drinkingAmountForm');
        this.countryForm = this.el.find('.readerCountryInput');

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    DrinkingAmountForm.prototype = {

        init: function () {
            var self = this;

            var searchSuggestionArray = [];
            $.each(DataModel, function (countryCode, country) {
                searchSuggestionArray.push({
                    value: country.name,
                    data: country
                });
            });

            this.countryForm.autocomplete({
                lookup: searchSuggestionArray,
                lookupFilter: self.filterSearchResults,
                autoSelectFirst: true,
                lookupLimit: 10,
                onSelect: self.onCountrySelect
            });

            /***************************
                * LISTENERS
            ***************************/

        },

        filterSearchResults: function (suggestion, query, queryLowerCase) {
            var matchFound = false;
            if (suggestion.data.otherNames) {
                for (var i = 0; i < suggestion.data.otherNames.length; i++) {
                    var otherName = suggestion.data.otherNames[i];
                    if (otherName.toLowerCase().indexOf(queryLowerCase) !== -1) {
                        matchFound = true;
                        break;
                    }
                }
            }

            return matchFound || suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
        },

        onCountrySelect: function (suggestion) {
            console.log(suggestion);
        }

    };

    return DrinkingAmountForm;

});