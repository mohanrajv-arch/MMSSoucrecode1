package esfita.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import esfita.dto.ComboBoxDTO;
import esfita.dto.MenuSimulationDTO;
import esfita.dto.ResponseDTO;
import esfita.service.MenuSimulationService;
import io.micrometer.observation.annotation.Observed;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequestMapping("/menuSimulationController")
public class MenuSimulationController {

	private final MenuSimulationService menuSimulationService;

	public MenuSimulationController(MenuSimulationService menuSimulationService) {
		this.menuSimulationService = menuSimulationService;
	}

	@Tag(name = "MenuSimulation")
	@GetMapping("/loadMealTypeDropDown")
	@Observed(name = "loadMealTypeDropDown", contextualName = "loadMealTypeDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadMealTypeDropDown() {
		return menuSimulationService.loadMealTypeDropDown();
	}

	@Tag(name = "MenuSimulation")
	@GetMapping("/loadCategoryDropDown")
	@Observed(name = "loadCategoryDropDown", contextualName = "loadCategoryDropDown")
	public ResponseDTO<List<ComboBoxDTO>> loadCategoryDropDown() {
		return menuSimulationService.loadCategoryDropDown();
	}

	@Tag(name = "MenuSimulation")
	@PostMapping("/recipeList")
	@Observed(name = "recipeList", contextualName = "recipeList")
	public ResponseDTO<List<MenuSimulationDTO>> recipeList(@RequestBody MenuSimulationDTO menuSimulationDTO) {
		return menuSimulationService.recipeList(menuSimulationDTO);
	}

	@Tag(name = "MenuSimulation")
	@PostMapping("/exportMenuSimulationExcel")
	@Observed(name = "exportMenuSimulationExcel", contextualName = "exportMenuSimulationExcel")
	public ResponseEntity<byte[]> exportMenuSimulationExcel(@RequestBody MenuSimulationDTO dto) {
		return menuSimulationService.exportMenuSimulationExcel(dto);
	}
}
