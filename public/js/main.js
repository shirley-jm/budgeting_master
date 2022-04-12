//BUDGET CONTROLLER
var BudgetController = ( function() {
  var Expense, Income, data, calculatetotal;

  Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  Expense.prototype.calpercentage = function(totalinc){
    if(totalinc>0){
      this.percentage = Math.round(this.value/totalinc*100);
    }
  };

  Expense.prototype.getpercentage = function(){
    return this.percentage;
  };

  calculatetotal = function(Arr){
    var sum=0;
    Arr.forEach(item => sum+=item.value);
    return sum;
  }

  data = {
    allItems: { exp:[], inc:[] },
    total: { exp: 0, inc: 0 },
    budget:0,
    per:-1
  };

  return {
    addItem: function(type, des, val) {
      var newItems, ID=0;
      //create new id
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length-1].id+1;
      }
        //create new item
      if(type === 'plus'){
        newItems = new Income(ID, des, val); 
      }else{
        newItems = new Expense(ID, des, val);
      }
      //push it into our data structure
      data.allItems[type].push(newItems);
      return newItems;
    },

    calculateBudget: function(){
      var inc, exp;

      inc = data.allItems.inc;
      exp = data.allItems.exp;

      //claculate total
      data.total.inc = calculatetotal(inc);
      data.total.exp = calculatetotal(exp);

      data.budget = data.total.inc - data.total.exp;
    },

    getBudget: function(){
      return {
        totalinc:data.total.inc,
        totalexp:data.total.exp,
        budget:data.budget,
        percentage:data.per
      }
    },
    //delete item
    deleteitem: function(type, id){
      var ids, index;
      ids=[]; 
      // id = 6
      //data.allItems[type][id];
      // ids = [1 2 4  8]
      //index = 3
            
      data.allItems[type].forEach(current => ids.push(current.id));

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    //calculate percentage
    calculatepercentage: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calpercentage(data.total.inc);
      })
    },

    //get percentage
    getpercentage: function(){
      var allPerc = [];

      data.allItems.exp.forEach(function(cur){
        allPerc.push(cur.percentage);
      })
      return allPerc;
    }
  }

})();


//UI CONTROLLER
var UiController = ( function() {
  
  var DomString = {
    inputType: '#sign',
    inputDescription: '.description',
    inputValue: '.value',
    inputbutton: '.add__btn',
    incomeContainer: '.income_desc',
    expensesContainer: '.expenses_desc',
    TotalIncome: '#income',
    TotalExpenses: '#expenses',
    AvailableBudget: '#amount',
    Detail: '.details',
    per_tab: '.tab_per',
    dateLabel: '.datetime'
  }

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };

  return {
    getInput: function(){
      return {
        type:document.querySelector(DomString.inputType).value,
        description:document.querySelector(DomString.inputDescription).value,
        value:parseFloat(document.querySelector(DomString.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      
      if (type === 'inc') {
          element = DomString.incomeContainer;
          
          html = '<div class="item" id="inc-%id%"><div class="item_description">%description%</div><div class="right"><div class="item_value">%value%</div><div class="item_delete"><button class="delete_btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
          element = DomString.expensesContainer;
      
          html = '<div class="item" id="exp-%id%"><div class="item_description">%description%</div><div class="right"><div class="item_value">%value%<span class="tab_per">%per%%</span></div><div class="item_delete"><button class="delete_btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      
      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);
      
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function(){
      var fields, fieldsArr;
            
        fields = document.querySelectorAll(DomString.inputDescription + ', ' + DomString.inputValue);
            
        fieldsArr = Array.prototype.slice.call(fields);
            
        fieldsArr.forEach(function(current, index, array) {
          current.value = "";
        });
            
        fieldsArr[0].focus();
    },

    displayBudget: function(obj){
      var per,type = obj.budget>=0?'inc':'exp';
      per = Math.round(obj.totalexp/obj.totalinc*100);

      document.querySelector(DomString.TotalIncome).textContent = formatNumber(obj.totalinc,'inc');
      document.querySelector(DomString.TotalExpenses).innerHTML = formatNumber(obj.totalexp,'exp') + ' <span class="tab_per">'+ (obj.totalinc>0?per:'---') + '%</span>';
      document.querySelector(DomString.AvailableBudget).textContent = formatNumber(obj.budget, type);
      
    },

    Deletelistitem: function(Id){
      var el = document.getElementById(Id);
      el.parentNode.removeChild(el);
    },

    displayper: function(allper){
      var fields, container = document.querySelector(DomString.expensesContainer);
      fields = container.querySelectorAll(DomString.per_tab);      
      
      var index = 0;
      
      fields.forEach(function(current){
                
        if (allper[index] > 0) {
            current.textContent = allper[index] + '%';
        } else {
            current.textContent = '---';
          }
        index++;
      });
    },

    displayMonth: function() {
      var now, months, month, year;
      
      now = new Date();
      //var christmas = new Date(2016, 11, 25);
      
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      
      year = now.getFullYear();
      document.querySelector(DomString.dateLabel).textContent = months[month] + ' ' + year;
    },

    getDomString: function(){
      return DomString;
    }
  };
})();


//APP CONTROLLER
var AppController = ( function(Budgetctrl, UiCtrl) {

  //1. Display the current month and year
  UiCtrl.displayMonth();
  
  var setupEventListener = function(){
    var Dom = UiCtrl.getDomString();

    //initailize to zero

    document.querySelector(Dom.TotalIncome).textContent = 0;
    document.querySelector(Dom.TotalExpenses).innerHTML = '0 <span class="tab_per">---%</span>';
    document.querySelector(Dom.AvailableBudget).textContent = 0;

    document.querySelector(Dom.inputbutton).addEventListener('click', ctrladditem);

    document.addEventListener('keypress', function(event) {
      if(event.key === 13 || event.which === 13){
        ctrladditem();
      }
    });
    //delete element
    document.querySelector(Dom.Detail).addEventListener('click', ctrDelete);
  };

  //budget control
  var updateBudget = function() {
        
    // 1. Calculate the budget
    Budgetctrl.calculateBudget();
    
    // 2. Return the budget
    var budget = Budgetctrl.getBudget();

    // 3. Display the budget on the UI
    UiCtrl.displayBudget(budget);
  };

  var updatepercentage = function(){
    //1. calculate percentage
    Budgetctrl.calculatepercentage(); 
    var allper = Budgetctrl.getpercentage();
    
    //2. update percentage in Ui
    UiCtrl.displayper(allper);

    //4. Number formatting


    //5. Improve input field UX

  };

  var ctrladditem = function() {
    
    //variable declaration
    var input, newitem;

    // 1.get the field input data
    input = UiCtrl.getInput();

    if(input.description !== "" && !isNaN(input.value)) {
      // 2. Add the item to the budget controller
      newitem = Budgetctrl.addItem(input.type,input.description,input.value);

      // 3. Add the item to UI
      UiCtrl.addListItem(newitem, input.type);

      // 4. Clear the fields
      UiCtrl.clearFields();

      // 5. update the budget
      updateBudget();
  
      //calculate and update percentage
      updatepercentage();      
    }
  };
    
  var ctrDelete = function(event){
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    //inc-1
    splitID = itemID.split('-');
    type = splitID[0];
    ID = parseInt(splitID[1]);

    // 1. delete the item from the data structure.
    Budgetctrl.deleteitem(type,ID);
    
    // 2. Delete the item from the UI.
    UiCtrl.Deletelistitem(itemID);

    // 3. Update and show the new budget.
    updateBudget();
    // 4. Calculate and update percentages
    updatepercentage();
  };

  return {
    init: function() {
      console.log('Application is satrated');
      setupEventListener();  
    }
  };

})(BudgetController, UiController);

AppController.init();