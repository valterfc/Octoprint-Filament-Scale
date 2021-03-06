/*
 * View model for OctoPrint-Filament_scale
 *
 * Author: Victor Noordhoek
 * License: AGPLv3
 */
$(function() {
    function Filament_scaleViewModel(parameters) {
        var self = this;
		self.printerState = parameters[0]
		self.settings = parameters[1]
		self.last_raw_weight = 0
		self.calibrate_known_weight = 0
        // assign the injected parameters, e.g.:
        // self.loginStateViewModel = parameters[0];
        // self.settingsViewModel = parameters[1];

        // TODO: Implement your plugin's view model here.
		self.printerState.filamentRemainingString = ko.observable("Loading...")
		self.tare = function(){
			
			self.settings.settings.plugins.filament_scale.tare(self.last_raw_weight)
			weight = self.getWeight(self.last_raw_weight)
			self.settings.settings.plugins.filament_scale.lastknownweight(weight)
			
			self.printerState.filamentRemainingString(self.getOutputWeight(weight))
		};
		self.calibrate=function(){
			
			weight = Math.round((self.last_raw_weight - self.settings.settings.plugins.filament_scale.tare()))
			self.settings.settings.plugins.filament_scale.reference_unit(weight / self.calibrate_known_weight)
			
			weight = self.getWeight(self.last_raw_weight)
			self.settings.settings.plugins.filament_scale.lastknownweight(weight)
			self.printerState.filamentRemainingString(self.getOutputWeight(weight))
			
		}
		self.onDataUpdaterPluginMessage = function(plugin, message){
			self.last_raw_weight = parseInt(message)
			weight = self.getWeight(message)
			self.settings.settings.plugins.filament_scale.lastknownweight(weight)
			self.printerState.filamentRemainingString(self.getOutputWeight(weight))
		};
		self.getWeight = function(weight){
			return Math.round((parseInt(weight) - self.settings.settings.plugins.filament_scale.tare()) / parseInt(self.settings.settings.plugins.filament_scale.reference_unit()))
		}
		self.getOutputWeight = function(weight){
			return (Math.max(weight - self.settings.settings.plugins.filament_scale.spool_weight(), 0) + "g")
		}
		self.onStartup = function() {
            var element = $("#state").find(".accordion-inner [data-bind='text: stateString']");
            if (element.length) {
                var text = gettext("Filament Remaining");
                element.after("<br>" + text + ": <strong data-bind='text: filamentRemainingString'></strong>");
            }
        };
		
	}
	
    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: Filament_scaleViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: ["printerStateViewModel", "settingsViewModel"],
        // Elements to bind to, e.g. #settings_plugin_filament_scale, #tab_plugin_filament_scale, ...
        elements: ["#settings_plugin_filament_scale"]
    });
});
