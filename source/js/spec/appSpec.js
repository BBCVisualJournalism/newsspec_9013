define(['lib/news_special/bootstrap', 'calculator'],  function (news, Calculator) {

    afterEach(function () {
        news.$('body').html('');
    });

    var exampleDataOne = {
        beers: 10,
        wines: 2,
        spirits: 5
    };
    var exampleNonDrinker = {
        beers: 0,
        wines: 0,
        spirits: 0
    };

    var countryDataOne = [5, 2, 3],
        countryNonDrinker = [0, 0, 0];


    describe('Calculator', function () {
        var calculator = new Calculator();

        it('gets user input values correctly', function () {
            news.$('body').append($('<input id="beerInput" value="12" />'));
            news.$('body').append($('<input id="wineInput" value="55" />'));
            news.$('body').append($('<input id="spiritsInput" value="99" />'));

            var result = calculator.getUserInput();

            expect(result.beers).toBe(12);
            expect(result.wines).toBe(55);
            expect(result.spirits).toBe(99);

        });

        it('get inputs returns false when invalid inputs', function () {
            news.$('body').append($('<input id="beerInput" value="asdd" />'));
            news.$('body').append($('<input id="wineInput" value="55" />'));
            news.$('body').append($('<input id="spiritsInput" value="99" />'));

            var result = calculator.getUserInput();

            expect(result).toBeFalsy();


            /* Ammend the error, ensure it works again */

            news.$('#beerInput').val('15');

            var resultTwo = calculator.getUserInput();

            expect(resultTwo.beers).toBe(15);
            expect(resultTwo.wines).toBe(55);
            expect(resultTwo.spirits).toBe(99);


        });


        it('calculates annual number of drinks', function () {
            var result = calculator.calcAnnualNumberOfDrinks(exampleDataOne);
            expect(result.beers).toBe(520);
            expect(result.wines).toBe(104);
            expect(result.spirits).toBe(260);

            var resultNoDrink = calculator.calcAnnualNumberOfDrinks(exampleNonDrinker);
            expect(resultNoDrink.beers).toBe(0);
            expect(resultNoDrink.wines).toBe(0);
            expect(resultNoDrink.spirits).toBe(0);

        });

        it('calculates annual total lites of alcohol by drink', function () {
            var result = calculator.calcReaderAnnualTotalsByDrink(exampleDataOne);

            expect(result.beers).toBe(14.768);
            expect(result.wines).toBe(2.184);
            expect(result.spirits).toBe(2.6);

            var resultNoDrink = calculator.calcReaderAnnualTotalsByDrink(exampleNonDrinker);
            expect(resultNoDrink.beers).toBe(0);
            expect(resultNoDrink.wines).toBe(0);
            expect(resultNoDrink.spirits).toBe(0);
        });


        it('calculates the annual total of lites of alcohol', function () {
            var result = calculator.calcAnnualTotal(exampleDataOne);
            expect(Math.round(result)).toBe(20);

            var resultNoDrink = calculator.calcAnnualTotal(exampleNonDrinker);
            expect(resultNoDrink).toBe(0);
        });

        it('calculates country average litres by drink', function () {
            var result = calculator.calcCountryDrinksPerYear(countryDataOne);

            expect(result.beers).toBe(176);
            expect(result.wines).toBe(95);
            expect(result.spirits).toBe(300);

            var resultNoDrink = calculator.calcCountryDrinksPerYear(countryNonDrinker);
            expect(resultNoDrink.beers).toBe(0);
            expect(resultNoDrink.wines).toBe(0);
            expect(resultNoDrink.spirits).toBe(0);
        });
    });

});