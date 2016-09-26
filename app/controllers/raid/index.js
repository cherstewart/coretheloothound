import Ember from 'ember';

export default Ember.Controller.extend({
  indexController: Ember.inject.controller('raids/index'),
  application: Ember.inject.controller(),
  currentAccount: Ember.computed.alias('application.model'),

  roles: Ember.computed.alias('indexController.roles'),
  rolesSorting: ['slug:desc'],
  sortedRoles: Ember.computed.sort('roles', 'rolesSorting'),

  selectedSignup: null,

  seatedByRole: Ember.computed('sortedRoles.[].id', 'model.seated.[].role', function() {
    var _this = this;

    return this.get('sortedRoles').map(function(role) {
      return Ember.Object.create({
        role: role,
        signups: _this.get('model.seated').filterBy('role.id', role.get('id')).sortBy('character.className', 'character.name')
      });
    });
  }),

  currentAccountSeated: Ember.computed('model.seated.[].character', 'currentAccount.id', function() {
    var accountId = this.get('currentAccount.id').toString();
    return this.get('model.seated').findBy('character.account.id', accountId);
  }),

  currentAccountSignedUp: Ember.computed('model.signups.[].character', 'currentAccount.id', function() {
    var accountId = this.get('currentAccount.id').toString();
    return this.get('model.signups').filterBy('character.account.id', accountId);
  }),

  characters: Ember.computed('currentAccount.characters', 'model.signedUpCharacterIds', function() {
    var ids = this.get('model.signedUpCharacterIds');
    return this.get('currentAccount.characters')
      .filter(function(character) {
        return !ids.includes(character.get('id'));
      })
      .sort(function(a,b) {
        var diff = b.get('level') - a.get('level');
        if(diff) {
          return diff;
        } else {
          return a.get('name').localeCompare(b.get('name'));
        }
      });
  }),

  actions: {
    seat(signup, role) {
      signup.set('seated', true);
      signup.set('role', role);
      signup.save();
    },

    unseat(signup) {
      signup.set('seated', false);
      signup.save();
    },

    unsignup(signup) {
      signup.destroyRecord();
    },

    selectSignup(signup) {
      if(this.get('selectedSignup') === signup) {
        this.set('selectedSignup', null);
      } else {
        this.set('selectedSignup', signup);
      }
    }
  }
});
