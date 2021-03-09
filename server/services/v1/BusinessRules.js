/**
 * Created by Mordekaiser on 30/01/17.
 */
exports.seniorityValidation = function (years) {
    if(years > 0 && years <= 4)
        return 100;
    else if(years === 5)
        return 500;
    else if(years >= 6 && years <= 9)
        return 200;
    else if(years === 10)
        return 1000;
    else if(years >= 11 && years <= 14)
        return 400;
    else if(years === 15)
        return 2000;
    else if(years >= 16 && years <= 19)
        return 600;
    else if(years === 20)
        return 3000;
    else if(years >= 21 && years <= 24)
        return 800;
    else if(years === 25)
        return 5000;
    else if(years >= 26 && years <= 29)
        return 1000;
    else if(years === 30)
        return 7500;
    else if(years >= 31 && years <= 34)
        return 1200;
    else if(years === 35)
        return 10000;
    else if(years >= 36 && years <= 39)
        return 10000;
    else if(years >= 40 && years <= 47)
        return 15000;
    else {
        return 0;
    }
};