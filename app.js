//budget controller
var budgetController = (function () {
    var Expense = function (id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percentage = -1;
    };

    var Income = function (id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
    };

    Expense.prototype.calcExpPercent = function (totInc) {
        if (totInc > 0) {
            this.percentage = Math.round((this.val / totInc) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.returnPercent = function () {
        return this.percentage;
    };

    var calculateSum = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (elem) {
            sum += elem.val;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        expensePercentage: -1
    };

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else ID = 0;

            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            if (type) {
                var idArr = data.allItems[type].map(function (curElem) {
                    return curElem.id;
                });
                var index = idArr.indexOf(id);
                if (index !== -1) data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //calculate the sum of Incomes and expenses
            calculateSum('inc');
            calculateSum('exp');

            //calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.expensePercentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.expensePercentage = -1;
            }
        },

        calcExpensePercentages: function () {
            data.allItems.exp.forEach(function (obj) {
                obj.calcExpPercent(data.totals.inc);
            });
        },

        retrievExpPercentages: function () {
            var allPercents = data.allItems.exp.map(function (e) {
                return e.returnPercent();
            });

            return allPercents;
        },

        returnBudget: function () {
            return {
                budgetTotal: data.budget,
                expTotal: data.totals.exp,
                incTotal: data.totals.inc,
                percentage: data.expensePercentage
            };
        },

        logToConsole: function () {
            console.log(data);
        }
    };
})();


//UI controller
var UIController = (function () {

    var DOMStrings = {
        inputSelection: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        totBudget: '.budget__value',
        totInc: '.budget__income--value',
        totExp: '.budget__expenses--value',
        expPerc: '.budget__expenses--percentage',
        container: '.container',
        expPercSelector: '.item__percentage',
        dateMonthSelector:'.budget__title--month'
    };

   var formatNumber= function(num,type){
        var int,dec,sign;
        num= Math.abs(num);
        num = num.toFixed(2);
        var numSplit = num.split('.');
        int = numSplit[0];
        dec= numSplit[1];
        if(int.length>3){
          int= int.substring(0,int.length-3)+','+int.substring(int.length-3);
        }
        sign = (type === 'inc') ?'+':'-';
        return (sign+' '+int+'.'+dec);
    };

    
    var nodeListForEach = function (nodes, callback) {
        for(var i=0;i<nodes.length;i++){
              callback(nodes[i],i);
        }
     };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputSelection).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            };
        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        addMonthAndYearToUI:function(){
           var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
           var date= new Date();
           var month = date.getMonth();
           var fullYear = date.getFullYear();
           var monthAndYear= (months[month]+' '+fullYear);
           document.querySelector(DOMStrings.dateMonthSelector).textContent = monthAndYear;
        },
        addItemToUI: function (obj, type) {
            var html, container;
            if (type === 'inc') {
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                container = DOMStrings.incomeContainer;
            }
            else if (type === 'exp') {
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                container = DOMStrings.expenseContainer;
            }

            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.desc);
            html = html.replace('%value%', formatNumber(obj.val,type));
            document.querySelector(container).insertAdjacentHTML('beforeend', html);
        },
        deleteItemFromUI: function (id) {
            var elem = document.getElementById(id);
            elem.parentNode.removeChild(elem);
        },
        clearInputFields: function () {
            var inputFlds, inputSelections;
            inputFlds = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            inputSelections = Array.prototype.slice.call(inputFlds);
            inputSelections.forEach(function (currentVal, Ind, arr) {
                currentVal.value = "";
            });
            inputSelections[0].focus();
        },  
        displayExpPercOnUI: function (percArray) {
            var fields = document.querySelectorAll(DOMStrings.expPercSelector);

            nodeListForEach(fields, function (elem, index) {
                    if(percArray[index] > 0) {
                        elem.textContent=percArray[index]+'%';
                    }
                    else{
                        elem.textContent= '---';
                    }
            });

        },

        updateInputStyles:function(){
             var nodes=  document.querySelectorAll(DOMStrings.inputSelection+','+DOMStrings.inputDescription+','+DOMStrings.inputValue);
             nodeListForEach(nodes,function(node){
                   node.classList.toggle('red-focus');
             });
             document.querySelector(DOMStrings.addButton).classList.toggle('red');

        },
        
        displayBudgetOnUI: function (dataObj) {
            var type;
            type = (dataObj.budgetTotal >=0)? 'inc' : 'exp' ;
            document.querySelector(DOMStrings.totBudget).textContent = formatNumber(dataObj.budgetTotal,type);
            document.querySelector(DOMStrings.totInc).textContent = formatNumber(dataObj.incTotal,'inc');
            document.querySelector(DOMStrings.totExp).textContent = formatNumber(dataObj.expTotal,'exp');

            if (dataObj.percentage > 0)
                document.querySelector(DOMStrings.expPerc).textContent = dataObj.percentage + '%';
            else
                document.querySelector(DOMStrings.expPerc).textContent = '---';

        }
    };
})();


//The app controller
var appController = (function (budCntrl, UICntrl) {
    var addEventlisteners = function () {
        var DOMInputStrings = UICntrl.getDOMStrings();

        document.querySelector(DOMInputStrings.addButton).addEventListener('click', function () {
            cntrlAddItem();
        });

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                cntrlAddItem();
            }
        });

        document.querySelector(DOMInputStrings.container).addEventListener('click', deleteContainerItems);
        document.querySelector(DOMInputStrings.inputSelection).addEventListener('change',UICntrl.updateInputStyles);
    };

    var calcandDispBudget = function () {
        // calc budget
        budCntrl.calculateBudget();
        //return budget
        var resultsObj = budCntrl.returnBudget();
        //display budget
        UICntrl.displayBudgetOnUI(resultsObj);
    };

    var calcPercentages = function () {
        // 1. calc percentages
        budCntrl.calcExpensePercentages();

        // 2. Get percentages
        var percentages = budCntrl.retrievExpPercentages();

        // 3. Display Percentages on UI
        UICntrl.displayExpPercOnUI(percentages);
    };

    var cntrlAddItem = function () {
        var inputData, newItem;
        //get input data
        inputData = UICntrl.getInput();

        if (inputData.description !== '' && !isNaN(inputData.value) && inputData.value > 0) {
            //add item to inc or expenses
            newItem = budCntrl.addItem(inputData.type, inputData.description, inputData.value);
            //budCntrl.logToConsole();
            //add item to UI
            UICntrl.addItemToUI(newItem, inputData.type);
            //Clear offthe input fields
            UICntrl.clearInputFields();
            calcandDispBudget();
            calcPercentages();
        }
    };

    var deleteContainerItems = function (event) {
        var divId, splitArr, type, itemId;
        divId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (divId) {
            splitArr = divId.split('-');
            type = splitArr[0];
            itemId = parseInt(splitArr[1]);
        }

        //1.delete item from data model
        budCntrl.deleteItem(type, itemId);

        //2.delete item from UI
        UICntrl.deleteItemFromUI(divId);

        //3.update the budget
        calcandDispBudget();

        //4.Calc nd Display percentages
        calcPercentages();
    };

    return {
        init: function () {
            console.log('Application Has Started!!');
            UICntrl.displayBudgetOnUI({
                budgetTotal: 0,
                expTotal: 0,
                incTotal: 0,
                percentage: -1
            });
            addEventlisteners();
            UICntrl.addMonthAndYearToUI();
        }
    };

})(budgetController, UIController);

appController.init();
