(function() {

var TabModule = Module.Base.extend({

	prototype: {

		options: {
			currentPaneClass: "tab-pane-current",
			currentTabClass: "tab-current"
		},

		toggle: function click(event, element, params) {
			if (params.stop) {
				event.stop();
			}
			else {
				event.preventDefault();
			}

			var group = new TabGroup(element),
			    value = element.getAttribute("data-tab-value"),
			    nextPane = group.getPaneByValue(value),
			    paneClass = this.options.currentPaneClass,
			    tabClass = this.options.currentTabClass,
			    nextTab = null,
			    prevPane = null,
			    prevTab = null,
			    toggled = false,
			    prevValue = null;

			group.forEach(function(tab, pane) {
				if (pane === nextPane) {
					if (pane.classList.contains(paneClass)) {
						return; // Tab did not change
					}

					pane.classList.add(paneClass);
					tab.classList.add(tabClass);
					nextTab = tab;
					toggled = true;
				}
				else if (pane.classList.contains(paneClass)) {
					pane.classList.remove(paneClass);
					tab.classList.remove(tabClass);
					prevPane = pane;
					prevTab = tab;
					prevValue = tab.getAttribute("data-tab-value");
				}
			}, this);

			if (toggled) {
				this.publish("tabs." + group.name + ".toggled", {
					group: group,
					value: value,
					nextTab: nextTab,
					nextPane: nextPane,
					prevTab: prevTab,
					prevPane: prevPane,
					prevValue: prevValue
				});
			}

			group.destructor();
		}

	}

});

function TabGroup(element) {
	this.setElement(element);
}
TabGroup.prototype = {

	element: null,

	name: "",

	_panes: null,

	_tabs: null,

	constructor: TabGroup,

	destructor: function() {
		this.element = this._panes = this._tabs = null;
	},

	forEach: function(callback, context) {
		context = context || this;

		var panes = this.getPanes(),
		    tabs = this.getTabs(),
		    tab, pane, i, lenght;

		for (i = 0, length = panes.length; i < length; i++) {
			tab = tabs[i];
			pane = panes[i];

			if (callback.call(context, tab, pane, i, this) === false) {
				break;
			}
		}
	},

	forEachPane: function(callback, context) {
		context = context || this;

		var panes = this.getPanes(),
		    i = 0,
		    length = panes.length;

		for (i; i < length; i++) {
			if (callback.call(context, panes[i], i, panes) === false) {
				break;
			}
		}
	},

	getPanes: function() {
		return this._panes ||
			(this._panes = this.element.querySelectorAll("[data-tab-pane=" + this.name + "]"));
	},

	getPaneByValue: function(value) {
		if (!value) {
			throw new Error("Missing required argument: value");
		}

		var pane = null;

		this.forEachPane(function(p) {
			if (p.getAttribute("data-tab-pane-value") === value) {
				pane = p;
				return false;
			}
		});

		return pane;
	},

	getTabs: function() {
		return this._tabs ||
			(this._tabs = this.element.querySelectorAll("[data-tab=" + this.name + "]"));
	},

	setElement: function(tab) {
		var groupToFind = tab.getAttribute("data-tab"),
		    element = tab;

		while (element = element.parentNode) {
			if (element.getAttribute("data-tab-group") === groupToFind) {
				this.element = element;
				this.name = element.getAttribute("data-tab-group");
				break;
			}
		}

		if (!this.element) {
			throw new Error("No element found for tab group: " + groupToFind);
		}
	}

};

Module.TabModule = TabModule;
Module.TabModule.TabGroup = TabGroup;

})();
