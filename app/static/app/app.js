var PersonRow = Vue.extend({
  components: {
    datepicker : VueStrap.datepicker
  },
  props: {
    person: Object//,
    // state: {
    //   type: String,
    //   default: 'default'
    // }
  },
    data:function(){
	return {state: 'default', editPerson: {}};
    },
  created:function(){
    this.initData();
  },
  methods: {
    initData: function(){
	this.editPerson = JSON.parse(JSON.stringify(this.person));
	//this.state = "default";
      this.errorMessages = {firstName: '', lastName:'', dateOfBirth:'', zipCode:''};
    },
    // Manage component state. Used for default, edit, and deleting states
    updateState: function(state){
      this.state = state;
    },
    // send api request to actually update state
    updatePerson:function(){
        axios.put('/api/person/' + this.person.id, this.editPerson).then((response) => {
            // success callback

            // set component state back to default
            this.updateState('default');

            // update the person objects
//            this.person = response.body;
	    this.$emit('updated', {id: this.person.id, newPerson: response.data})
          // Re init data
  //          this.initData();

        }, (response) => {
            var response = response.body;
            this.errorMessages = Object.assign({}, this.errorMessages, response.message)
            console.log(this.errorMessages)

        });
    },
    // send api request to actually delete user
    deletePerson:function(){
        // GET /someUrl
        axios.delete('/api/person/'+this.person.id).then((response) => {
            // success callback
            this.$emit('removed', {id: this.person.id})
        }, (response) => {
            // error callback
        });
    }
  },
  template: ` <tr v-bind:class="{ 'info': state == 'editing', 'danger': state == 'deleting'  }">
                <td >
                  <span> {{ person.id }} </span>
                </td>
                <td >
                  <span  v-if="state != 'editing'"> {{ person.firstName }} </span>
                  <input v-if="state == 'editing'" type="text" required class="form-control" v-model="editPerson.firstName" placeholder="First Name">
                  <div class="error-message" v-if="state == 'editing'"> {{ errorMessages.firstName }} </div>
                </td>
                <td >
                  <span  v-if="state != 'editing'"> {{ person.lastName }} </span>
                  <input v-if="state == 'editing'" type="text" required class="form-control" v-model="editPerson.lastName" placeholder="First Name">
                  <div class="error-message" v-if="state == 'editing'"> {{ errorMessages.lastName }} </div>
                </td>
                <td >
                  <span  v-if="state != 'editing'"> {{ person.dateOfBirth }} </span>
                  <datepicker v-if="state == 'editing'" v-model="editPerson.dateOfBirth" ></datepicker>
                  <div class="error-message" v-if="state == 'editing'"> {{ errorMessages.dateOfBirth }} </div>
                </td>
                <td >
                  <span  v-if="state != 'editing'"> {{ person.zipCode }} </span>
                  <input v-if="state == 'editing'" type="text" required class="form-control" v-model="editPerson.zipCode" placeholder="Zp Code">
                  <div class="error-message" v-if="state == 'editing'"> {{ errorMessages.zipCode }} </div>
                </td>

                <td v-if="state == 'default'">
                  <button class="btn btn-xs btn-info" v-on:click="updateState('editing')" >Edit</button>
                  <button class="btn btn-xs btn-danger" v-on:click="updateState('deleting')" >Delete</button>
                </td>
                <td v-if="state == 'editing'">
                  <button class="btn btn-xs btn-default" v-on:click="updateState('default')" >Cancle</button>
                  <button class="btn btn-xs btn-success" v-on:click="updatePerson()" >Save</button>
                </td>
                <td v-if="state == 'deleting'">
                  <button class="btn btn-xs btn-default" v-on:click="updateState('default')" >Cancle</button>
                  <button class="btn btn-xs btn-danger" v-on:click="deletePerson()" >Confirm</button>
                </td>
              </tr>`
})

var vm = new Vue({

  // We want to target the div with an id of 'events'
  el: '#app',

  // Here we can register any values or collections that hold data
  // for the application
  data: {
    people:[],
    newPerson:{ firstName:'', lastName:'', dateOfBirth:'',zipCode:'', loading:false },
    newPersonMessages:{ firstName:'', lastName:'', dateOfBirth:'',zipCode:'' }
  },
  components: {
    datepicker : VueStrap.datepicker,
    personRow: PersonRow
  },

  // Anything within the ready function will run when the application loads
  // mounted hook in 2.0
  mounted: function() {
    this.getPeople();
  },

  // Methods we want to use in our application are registered here
  methods: {
    getPeople:function(){
        // GET /someUrl
        axios.get('/api/person').then((response) => {
            // success callback
            this.people = response.data ;
        }, (response) => {
            // error callback
        });
    },
    removePerson:function(args){
      var personIndex = this.findPersonIndexById(args.id);
      if(personIndex > -1 ){
        this.people.splice(personIndex ,1)
      }
    },
    updatePerson:function(args){
      var personIndex = this.findPersonIndexById(args.id);
      if(personIndex > -1 ){
          //this.people[personIndex] = args.newPerson;
	  this.people.splice(personIndex,1,args.newPerson);
      }
    },

      findPersonIndexById:function(id){
      // Check each person for id, if found return that index. Otherwise return -1
      for (var i=0; i < this.people.length; i++) {
          if (this.people[i].id === id) {
              return i;
          }
      }
      return -1;
    },
    addPerson:function(e){

        this.newPerson.loading = true;
        var person = this.newPerson;
        // GET /someUrl
        axios.post('/api/person', person).then((response) => {
            // success callback
            var newPerson = response.data;

            // Turn of loading
            this.newPerson.loading = false;

            // Clear out new person form
            this.newPerson.firstName = '';
            this.newPerson.lastName = '';
            this.newPerson.dateOfBirth = '';
            this.newPerson.zipCode = '';

            // add new person to start of list
            this.people.unshift(newPerson);
        }, (response) => {
          console.log(response)
            // error callback
            this.newPerson.loading = false;
        });

    }
  },
/*
  events: {
    'remove-person': function (data) {
      if(data && data.id){
        this.removePerson(data.id);
      }
    },
    'add-person': function (newPerson) {
      if(newPerson){
        this.people.unshift(newPerson);
      }
    }
  }*/
});
