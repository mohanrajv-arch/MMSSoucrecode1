package esfita.controller.menuSimulaion;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import esfita.controller.MenuSimulationController;
import esfita.dto.ComboBoxDTO;
import esfita.dto.MenuSimulationDTO;
import esfita.dto.ResponseDTO;
import esfita.service.MenuSimulationService;

@ExtendWith(MockitoExtension.class)
class MenuSimulationControllerTest {

	@Mock
	private MenuSimulationService menuSimulationService;

	@InjectMocks
	private MenuSimulationController menuSimulationController;

	@Test
	void testLoadMealTypeDropDown() {
		// Given
		ResponseDTO<List<ComboBoxDTO>> dto = new ResponseDTO<>();
		dto.setSuccess(true);
		dto.setData(Collections.emptyList());

		when(menuSimulationService.loadMealTypeDropDown()).thenReturn(dto);

		// When
		ResponseDTO<List<ComboBoxDTO>> result = menuSimulationController.loadMealTypeDropDown();

		// Then
		assertNotNull(result);
		assertTrue(result.isSuccess());
		verify(menuSimulationService, times(1)).loadMealTypeDropDown();
	}

	@Test
	void testLoadCategoryDropDown() {
		// Given
		ResponseDTO<List<ComboBoxDTO>> dto = new ResponseDTO<>();
		dto.setSuccess(true);
		dto.setData(Collections.emptyList());

		when(menuSimulationService.loadCategoryDropDown()).thenReturn(dto);

		// When
		ResponseDTO<List<ComboBoxDTO>> result = menuSimulationController.loadCategoryDropDown();

		// Then
		assertNotNull(result);
		assertTrue(result.isSuccess());
		verify(menuSimulationService, times(1)).loadCategoryDropDown();
	}

	@Test
	void testRecipeList() {
		// Given
		ResponseDTO<List<MenuSimulationDTO>> dto = new ResponseDTO<>();
		dto.setSuccess(true);
		dto.setData(Collections.emptyList());

		when(menuSimulationService.recipeList(any())).thenReturn(dto);

		// When
		ResponseDTO<List<MenuSimulationDTO>> result = menuSimulationController.recipeList(new MenuSimulationDTO());

		// Then
		assertNotNull(result);
		assertTrue(result.isSuccess());
		verify(menuSimulationService, times(1)).recipeList(any());
	}

	@SuppressWarnings("deprecation")
	@Test
	void testExportMenuSimulationExcel() {
		// Given
		byte[] mockBytes = new byte[0];
		ResponseEntity<byte[]> expected = ResponseEntity.ok(mockBytes);

		when(menuSimulationService.exportMenuSimulationExcel(any())).thenReturn(expected);

		// When
		ResponseEntity<byte[]> result = menuSimulationController.exportMenuSimulationExcel(new MenuSimulationDTO());

		// Then
		assertNotNull(result);
		assertEquals(200, result.getStatusCodeValue());
		verify(menuSimulationService, times(1)).exportMenuSimulationExcel(any());
	}
}
