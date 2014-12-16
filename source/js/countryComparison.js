define(['lib/news_special/bootstrap', 'calculator', 'countryAutocomplete', 'data'], function (news, Calcualtor, CountryAutocomplete, DataModel) {

    'use strict';

    var CountryComparison = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.navigableCountryData');
        this.countryInputEl = this.el.find('.countryCompareInput');
        this.calculator = new Calcualtor();

        this.selectedCountry = null;
        this.countryInput = null;

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    CountryComparison.prototype = {

        init: function () {
            this.countryInput = new CountryAutocomplete(this.countryInputEl, this.countrySelected.bind(this));
            news.pubsub.on('country:selected', this.countrySelected.bind(this));

        },

        countrySelected: function (country) {
            this.el.removeClass('notDisplayed');
            this.countryInput.setCountry(country);

            var userInput = this.calculator.getUserInput();

            this.compareUserToCountry(userInput);
            this.printCountryData(userInput);
        },

        compareUserToCountry: function (userInput) {
            var userCountry = this.countryInput.getSelectedCountry(),
                countryData = DataModel[userCountry.countryCode];

            var readerAnnualDrinks = this.calculator.calcAnnualNumberOfDrinks(userInput),
                readerLitres = this.calculator.calcAnnualTotal(userInput),
                countryAnnualDrinks = this.calculator.calcCountryDrinksPerYear(countryData.drinksData);

            if (readerLitres > 0) {



                var percentageDifferenceMen = 100 - ((readerLitres / countryData['overallConsumptionMen']) * 100);
                var moreOrLessMen = readerLitres > countryData['overallConsumptionMen'] ? 'more' : 'less';

                var percentageDifferenceWomen = 100 - ((readerLitres / countryData['overallConsumptionWomen']) * 100);
                var moreOrLessWomen = readerLitres > countryData['overallConsumptionWomen'] ? 'more' : 'less';

                var totalLitresRounded = Math.round(readerLitres);

                $('.totalAmountsDrunk .totalLitres').text(totalLitresRounded + ((totalLitresRounded === 1) ? ' litre' : ' litres'));
                $('.totalAmountsDrunk .menComparison').text(Math.abs(Math.round(percentageDifferenceMen)) + '% ' + moreOrLessMen);
                $('.totalAmountsDrunk .countryName').text(countryData['ifNameNeedsAThePrefix'] + countryData['name']);
                $('.totalAmountsDrunk .womenComparison').text(Math.abs(Math.round(percentageDifferenceWomen)) + '% ' + moreOrLessWomen);

                console.log(countryData);

                var compatriotBeerComparison = readerAnnualDrinks.beers - countryAnnualDrinks.beers,
                    compatriotWineComparison = readerAnnualDrinks.wines - countryAnnualDrinks.wines,
                    compatriotSpiritsComparison = readerAnnualDrinks.spirits - countryAnnualDrinks.spirits;

                $('.totalAmountsDrunk .compatriotBeerComparison').text(Math.abs(compatriotBeerComparison) + ((readerAnnualDrinks.beers > countryAnnualDrinks.beers) ? ' more' : ' fewer'));
                $('.totalAmountsDrunk .compatriotWineComparison').text(Math.abs(compatriotWineComparison) + ((readerAnnualDrinks.wines > countryAnnualDrinks.wines) ? ' more' : ' fewer'));
                $('.totalAmountsDrunk .compatriotSpiritsComparison').text(Math.abs(compatriotSpiritsComparison) + ((readerAnnualDrinks.spirits > countryAnnualDrinks.spirits) ? ' more' : ' fewer'));

                $('.totalAmountsDrunk').removeClass('notDisplayed');

            } else {
                $('.totalAmountsDrunk').addClass('notDisplayed');
            }
        },

        printCountryData: function (userInput) {
            var userCountry = this.countryInput.getSelectedCountry(),
                countryData = DataModel[userCountry.countryCode],
                countryAnnualDrinks = this.calculator.calcCountryDrinksPerYear(countryData.drinksData);


            if (userCountry !== false && typeof countryData !== 'undefined') {

                var countryPintsPerYear = countryAnnualDrinks.beers,
                    countryGlassesOfWinePerYear = countryAnnualDrinks.wines,
                    countryShotsPerYear = countryAnnualDrinks.spirits;

                var litresOfAlcoholFromOtherSourcesPerYear = countryData['drinksData'][3];

                console.log(litresOfAlcoholFromOtherSourcesPerYear);

                $('#ppCountry').text(countryData['ifNameNeedsAThePrefix'] + countryData['name']);

                $('#ppBeers .largeNumber').text(countryPintsPerYear);
                $('#ppWines .largeNumber').text(countryGlassesOfWinePerYear);
                $('#ppSpirits .largeNumber').text(countryShotsPerYear);

                if (countryPintsPerYear === 1) {
                    $('.beerText .words .plural').addClass('notDisplayed');
                } else {
                    $('.beerText .words .plural').removeClass('notDisplayed');
                }

                if (countryGlassesOfWinePerYear === 1) {
                    $('.wineText .words .plural').addClass('notDisplayed');
                } else {
                    $('.wineText .words .plural').removeClass('notDisplayed');
                }

                if (countryShotsPerYear === 1) {
                    $('.spiritsText .words .plural').addClass('notDisplayed');
                } else {
                    $('.spiritsText .words .plural').removeClass('notDisplayed');
                }

                if (litresOfAlcoholFromOtherSourcesPerYear > 0.01) {
                    $('.navigableCountryOtherText strong').text(litresOfAlcoholFromOtherSourcesPerYear.toFixed(1) +
                        ((litresOfAlcoholFromOtherSourcesPerYear.toFixed(2) === 1) ? ' litre' : ' litres'));

                    $('.navigableCountryOtherText').removeClass('notDisplayed');
                } else {
                    $('.navigableCountryOtherText').addClass('notDisplayed');
                }
                $('.morenavigableCountryData .totalLitres').text(countryData['overallConsumptionBothSexes'] + ((countryData['overallConsumptionBothSexes'] === 1) ? ' litre' : ' litres'));
                $('.morenavigableCountryData .countryName').text(countryData['ifNameNeedsAThePrefix'] + countryData['name']);
                $('.morenavigableCountryData .countryRank').text(countryData['overallRank']);

            }
        }
    };

    return CountryComparison;

});