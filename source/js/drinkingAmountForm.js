define(['lib/news_special/bootstrap', 'data', 'lib/vendors/jquery.autocomplete'], function (news, DataModel) {

    'use strict';

    var DrinkingAmountForm = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.drinkingAmountForm');
        this.countryForm = this.el.find('.readerCountryInput');
        this.submitButton = this.el.find('.submitButton');
        this.selectedCountry = null;

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

                country.countryCode = countryCode;

                var suggestion = {
                    value: country.name,
                    data: country
                };
                searchSuggestionArray.push(suggestion);

                if (countryCode === 'GBR') {
                    self.selectedCountry = suggestion;
                }
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
            this.submitButton.on('click', this.showResults.bind(this));
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
            this.selectedCountry = suggestion;
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

        getUserCountry: function () {
            console.log(this.selectedCountry);
            return (this.selectedCountry.value === this.countryForm.val()) ? this.selectedCountry.data : false;
        },

        showResults: function () {
            var readerAnswers = this.getUserInput(),
                userCountry = this.getUserCountry();

            if (readerAnswers === false || userCountry === false) {
                return;
            }


            var readerAnnualNumberOfDrinks = this.calcAnnualNumberOfDrinks(readerAnswers),
                readerAnnualTotalsByDrink = this.calcReaderAnnualTotalsByDrink(readerAnswers),
                totalLitresOfAlcoholPerYear = this.calcAnnualTotal(readerAnnualTotalsByDrink),
                countryData = DataModel[userCountry.countryCode]['drinksData'],
                comparisonCountryAnnualNumberOfDrinks = this.calcCountryDrinksPerYear(countryData),
                closestFittingKey = this.findClosestMatchingCountryKey(readerAnnualTotalsByDrink);

                console.log(closestFittingKey);

            if (closestFittingKey === null) {
                this.showOnGraph('BLR');
                this.printConsumptionData(readerAnnualNumberOfDrinks);
                $('.outputContainer, .graphOutput, .noCloseFitHeadlineResult').removeClass('notDisplayed');
                $('.headlineResult, .nonDrinkerHeadlineResult, .share, .basedOnThis').addClass('notDisplayed');
            } else {
                this.showOnGraph(closestFittingKey);
                $('.share, .outputContainer, .graphOutput').removeClass('notDisplayed');
                $('.alternativeHeadlineResults').addClass('notDisplayed');
                this.printConsumptionData(readerAnnualNumberOfDrinks);
                if (closestFittingKey === 'KWT') {
                    $('.headlineResult, .outputContainer, .basedOnThis').addClass('notDisplayed');
                    $('.nonDrinkerHeadlineResult, .graphOutput').removeClass('notDisplayed');
                    $('.heatMapHeadline').text('Explore the world\'s drinking habits:');
                } else {
                    $('.headlineResult, .basedOnThis').removeClass('notDisplayed');
                    $('.alternativeHeadlineResults').addClass('notDisplayed');
                    $('.headlineResult .countryName').text(DataModel[closestFittingKey]['ifNameNeedsAThePrefix'] + DataModel[closestFittingKey]['name']);
                    $('.headlineResult .countryRank').text(DataModel[closestFittingKey]['overallRank']);
                }
            }
        },

        calcAnnualNumberOfDrinks: function (readerAnswers) {
            var pintsPerYear = Math.round(readerAnswers.beers * 52),
                glassesOfWinePerYear = Math.round(readerAnswers.wines * 52),
                shotsPerYear = Math.round(readerAnswers.spirits * 52);

            return {
                beers: pintsPerYear,
                wines: glassesOfWinePerYear,
                spirits: shotsPerYear
            };
        },

        calcReaderAnnualTotalsByDrink: function (readerAnswers) {

            var litresOfAlcoholFromBeerPerYear = readerAnswers.beers * 52 * 2.8 * 0.01,
                litresOfAlcoholFromWinePerYear = readerAnswers.wines * 52 * 2.1 * 0.01,
                litresOfAlcoholFromSpiritsPerYear = readerAnswers.spirits * 52 * 1 * 0.01;

            return {
                beers: litresOfAlcoholFromBeerPerYear,
                wines: litresOfAlcoholFromWinePerYear,
                spirits: litresOfAlcoholFromSpiritsPerYear
            };
        },

        calcAnnualTotal: function (litresOfAlcoholByDrinkType) {
            return litresOfAlcoholByDrinkType.beers + litresOfAlcoholByDrinkType.wines + litresOfAlcoholByDrinkType.spirits;
        },

        calcCountryDrinksPerYear: function (countryData) {
            var countryPintsPerYear = Math.round(countryData.beer / 2.8 / 0.01),
                countryGlassesOfWinePerYear = Math.round(countryData.wines / 2.1 / 0.01),
                countryShotsPerYear = Math.round(countryData.spirits / 1 / 0.01);

            return {
                beers: countryPintsPerYear,
                wines: countryGlassesOfWinePerYear,
                spirits: countryShotsPerYear
            }

        },

        findClosestMatchingCountryKey: function (readerAnnualTotalsByDrink) {

            var DIFFERENCE_THRESHOLD = 15;

            var lowestDifference = Number.POSITIVE_INFINITY;
            var closestFittingKey = '';
            for (var key in DataModel) {
                var drinksData = DataModel[key]['drinksData'];

                var difference = 0;
                difference += (Math.pow(readerAnnualTotalsByDrink.beers - drinksData[0], 2));
                difference += (Math.pow(readerAnnualTotalsByDrink.wines - drinksData[1], 2));
                difference += (Math.pow(readerAnnualTotalsByDrink.spirits - drinksData[2], 2));
                difference = Math.sqrt(difference);

                if (difference < lowestDifference) {
                    lowestDifference = difference;
                    closestFittingKey = key;
                }
            }

            if (lowestDifference < DIFFERENCE_THRESHOLD) {
                return closestFittingKey;
            } else {
                return null;
            }
        },

        showOnGraph: function (countryID) {

            $('.divToDisplay').removeClass('divToDisplay');

            $('.alcoholGraph #bar-' + countryID + ' .bar').addClass('divToDisplay');

            $('.alcoholGraph #bar-' + countryID + ' .caption').html('<p class="smallerText">' + DataModel[countryID]['name'] + '</p>');

            $('.alcoholGraph #bar-' + countryID + ' .caption').addClass('divToDisplay');

            if (parseInt(DataModel[countryID]['overallConsumptionMen']) < 10) {
                $('.alcoholGraph').addClass("invert");
            } else {
                $('.alcoholGraph').removeClass("invert");
            }

        },

        printConsumptionData: function (annualNumberOfDrinks) {

            var pintsPerYear = annualNumberOfDrinks.beers,
                glassesOfWinePerYear = annualNumberOfDrinks.wines,
                shotsPerYear = annualNumberOfDrinks.spirits;

            $('#beerText .largeNumber').text(pintsPerYear.toLocaleString());

            $('#wineText .largeNumber').text(glassesOfWinePerYear.toLocaleString());

            $('#spiritsText .largeNumber').text(shotsPerYear.toLocaleString());

            $('#annualisedDrinkIconsTitle').removeClass('notDisplayed');

        }


    };

    return DrinkingAmountForm;

});