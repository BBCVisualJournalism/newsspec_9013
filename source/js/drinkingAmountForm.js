define(['lib/news_special/bootstrap', 'calculator', 'countryAutocomplete', 'data'], function (news, Calculator, CountryAutocomplete, DataModel) {

    'use strict';

    var DrinkingAmountForm = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.drinkingAmountForm');
        this.countryInputEl = this.el.find('.readerCountryInput');
        this.submitButton = this.el.find('.submitButton');
        this.calculator = new Calculator();

        this.countryInput = null;

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    DrinkingAmountForm.prototype = {

        init: function () {
            this.countryInput =  new CountryAutocomplete(this.countryInputEl);

            /***************************
                * LISTENERS
            ***************************/
            this.submitButton.on('click', this.showResults.bind(this));
        },

        showResults: function () {
            var readerAnswers = this.calculator.getUserInput(),
                userCountry = this.countryInput.getSelectedCountry();

            if (readerAnswers === false || userCountry === false) {
                return;
            }

            var readerAnnualDrinks = this.calculator.calcAnnualNumberOfDrinks(readerAnswers),
                readerAnnualTotalsByDrink = this.calculator.calcReaderAnnualTotalsByDrink(readerAnswers),
                countryData = DataModel[userCountry.countryCode]['drinksData'],
                closestFittingKey = this.findClosestMatchingCountryKey(readerAnnualTotalsByDrink);

            if (closestFittingKey === null) {
                this.showOnGraph('BLR');
                this.printConsumptionData(readerAnnualDrinks);
                $('.outputContainer, .heatMapContainer, .graphOutput, .noCloseFitHeadlineResult').removeClass('notDisplayed');
                $('.headlineResult, .nonDrinkerHeadlineResult, .share, .basedOnThis').addClass('notDisplayed');
            } else {
                this.showOnGraph(closestFittingKey);
                $('.share, .heatMapContainer, .outputContainer, .graphOutput').removeClass('notDisplayed');
                $('.alternativeHeadlineResults').addClass('notDisplayed');
                this.printConsumptionData(readerAnnualDrinks);
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

            this.printHomeCountryHealthData(userCountry);

            news.pubsub.emit('country:selected', userCountry);
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

            if (parseInt(DataModel[countryID]['overallConsumptionMen'], 10) < 10) {
                $('.alcoholGraph').addClass('invert');
            } else {
                $('.alcoholGraph').removeClass('invert');
            }

        },

        printConsumptionData: function (annualNumberOfDrinks) {

            var pintsPerYear = annualNumberOfDrinks.beers,
                glassesOfWinePerYear = annualNumberOfDrinks.wines,
                shotsPerYear = annualNumberOfDrinks.spirits;

            $('.beerText .largeNumber').text(pintsPerYear);

            $('.wineText .largeNumber').text(glassesOfWinePerYear);

            $('.spiritsText .largeNumber').text(shotsPerYear);

        },

        printHomeCountryHealthData: function (countryData) {

            $('.healthAdvice').removeClass('notDisplayed');

            if (countryData['bingeDrinkingMenProportion'] !== null && countryData['bingeDrinkingWomenProportion'] !== null && countryData['abstainersPast12MonthsProportion'] !== null) {
                
                $('#heavyDrinkersData .heavyDrinkingMen').text(Math.round(countryData['bingeDrinkingMenProportion']) + "%");
                $('.healthAdvice').find('.countryName').text(countryData['ifNameNeedsAThePrefix'] + countryData['name']);
                $('#heavyDrinkersData .heavyDrinkingWomen').text(Math.round(countryData['bingeDrinkingWomenProportion']) + "%");
                $('#abstainersData .abstentionRate').text(Math.round(countryData['abstainersPast12MonthsProportion']) + "%");

                $('.generalHomeCountryData').removeClass('notDisplayed');
            } else {
                $('.generalHomeCountryData').addClass('notDisplayed');
            }

        }


    };

    return DrinkingAmountForm;

});