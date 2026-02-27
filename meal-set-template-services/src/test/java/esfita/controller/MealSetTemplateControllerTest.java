package esfita.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import esfita.dto.ComboBoxDTO;
import esfita.dto.MealSetTemplateDTO;
import esfita.dto.ResponseDTO;
import esfita.service.MealSetTemplateService;
import io.micrometer.tracing.Tracer;

@WebMvcTest(MealSetTemplateController.class)
@AutoConfigureMockMvc(addFilters = false)
class MealSetTemplateControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private MealSetTemplateService mealSetTemplateService;

	@MockBean
	private Tracer tracer; // IMPORTANT (fixes context failure)

	@Autowired
	private ObjectMapper objectMapper;

	// ---------------- LOAD MEAL TYPE ----------------

	@Test
	void loadMealTypeDropDown_shouldReturnSuccess() throws Exception {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(Collections.singletonList(new ComboBoxDTO()));

		when(mealSetTemplateService.loadMealTypeDropDown()).thenReturn(response);

		mockMvc.perform(get("/mealSetTemplateController/loadMealTypeDropDown")).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	// ---------------- LOAD CATEGORY ----------------

	@Test
	void loadCategoryDropDown_shouldReturnSuccess() throws Exception {

		ResponseDTO<List<ComboBoxDTO>> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(Collections.singletonList(new ComboBoxDTO()));

		when(mealSetTemplateService.loadCategoryDropDown()).thenReturn(response);

		mockMvc.perform(get("/mealSetTemplateController/loadCategoryDropDown")).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	// ---------------- LIST ----------------

	@Test
	void mealSetTemplateList_shouldReturnSuccess() throws Exception {

		MealSetTemplateDTO requestDto = new MealSetTemplateDTO();

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(new MealSetTemplateDTO());

		when(mealSetTemplateService.mealSetTemplateList(any(MealSetTemplateDTO.class))).thenReturn(response);

		mockMvc.perform(post("/mealSetTemplateController/mealSetTemplateList").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(requestDto))).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	// ---------------- SAVE ----------------

	@Test
	void saveMealSetTemplate_shouldWriteJsonAndReturnSuccess() throws Exception {

		MealSetTemplateDTO requestDto = new MealSetTemplateDTO();

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(new MealSetTemplateDTO());

		when(mealSetTemplateService.saveMealSetTemplate(any(MealSetTemplateDTO.class))).thenReturn(response);

		// 🔥 Mock static Files.write
		try (MockedStatic<Files> filesMock = Mockito.mockStatic(Files.class)) {

			filesMock.when(() -> Files.write(any(Path.class), any(byte[].class), eq(StandardOpenOption.CREATE),
					eq(StandardOpenOption.TRUNCATE_EXISTING))).thenReturn(null);

			mockMvc.perform(post("/mealSetTemplateController/saveMealSetTemplate")
					.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestDto)))
					.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
		}
	}

	// ---------------- MODIFY ----------------

	@Test
	void modifyMealSetTemplate_shouldWriteJsonAndReturnSuccess() throws Exception {

		MealSetTemplateDTO requestDto = new MealSetTemplateDTO();

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(new MealSetTemplateDTO());

		// ✅ FIX 1: any()
		when(mealSetTemplateService.modifyMealSetTemplate(any(MealSetTemplateDTO.class))).thenReturn(response);

		// ✅ FIX 2: mock static Files.write
		try (MockedStatic<Files> filesMock = Mockito.mockStatic(Files.class)) {

			filesMock.when(() -> Files.write(any(Path.class), any(byte[].class), eq(StandardOpenOption.CREATE),
					eq(StandardOpenOption.TRUNCATE_EXISTING))).thenReturn(null);

			mockMvc.perform(post("/mealSetTemplateController/modifyMealSetTemplate")
					.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestDto)))
					.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
		}
	}

	// ---------------- VIEW BY ID ----------------

	@Test
	void mealSetViewById_shouldReturnSuccess() throws Exception {

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(new MealSetTemplateDTO());

		when(mealSetTemplateService.mealSetViewById(1)).thenReturn(response);

		mockMvc.perform(get("/mealSetTemplateController/mealSetViewById").param("id", "1")).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	// ---------------- COPY ----------------

	@Test
	void saveMealSetTemplateCopy_shouldReturnSuccess() throws Exception {

		MealSetTemplateDTO requestDto = new MealSetTemplateDTO();

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);

		when(mealSetTemplateService.saveMealSetTemplateCopy(any(MealSetTemplateDTO.class))).thenReturn(response);

		mockMvc.perform(post("/mealSetTemplateController/saveMealSetTemplateCopy")
				.contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(requestDto)))
				.andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
	}

	// ---------------- APPROVAL ----------------

	@Test
	void saveApprovalStatus_shouldReturnSuccess() throws Exception {

		MealSetTemplateDTO requestDto = new MealSetTemplateDTO();

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);

		when(mealSetTemplateService.saveApprovalStatus(any(MealSetTemplateDTO.class))).thenReturn(response);

		mockMvc.perform(post("/mealSetTemplateController/saveApprovalStatus").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(requestDto))).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	@Test
	void mealSetStatusUpdate_shouldReturnSuccess() throws Exception {

		MealSetTemplateDTO dto = new MealSetTemplateDTO();

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);

		when(mealSetTemplateService.mealSetStatusUpdate(any(MealSetTemplateDTO.class))).thenReturn(response);

		mockMvc.perform(post("/mealSetTemplateController/mealSetStatusUpdate").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(dto))).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	@Test
	void modifyViewById_shouldReturnSuccess() throws Exception {

		ResponseDTO<MealSetTemplateDTO> response = new ResponseDTO<>();
		response.setSuccess(true);
		response.setData(new MealSetTemplateDTO());

		when(mealSetTemplateService.modifyViewById(1)).thenReturn(response);

		mockMvc.perform(get("/mealSetTemplateController/modifyViewById").param("id", "1")).andExpect(status().isOk())
				.andExpect(jsonPath("$.success").value(true));
	}

	@Test
	void listDownload_shouldWriteJsonAndReturnFile() throws Exception {

		MealSetTemplateDTO dto = new MealSetTemplateDTO();

		when(mealSetTemplateService.exportMealSetTemplateExcel(any(MealSetTemplateDTO.class)))
				.thenReturn(ResponseEntity.ok(new byte[] { 1, 2, 3 }));

		try (MockedStatic<Files> filesMock = Mockito.mockStatic(Files.class)) {

			filesMock.when(() -> Files.write(any(Path.class), any(byte[].class), eq(StandardOpenOption.CREATE),
					eq(StandardOpenOption.TRUNCATE_EXISTING))).thenReturn(null);

			mockMvc.perform(post("/mealSetTemplateController/listDownload").contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(dto))).andExpect(status().isOk());
		}
	}

	@Test
	void viewDownload_shouldReturnExcelBytes() throws Exception {

		when(mealSetTemplateService.exportMealSetTemplateDetailExcel(1, 2))
				.thenReturn(ResponseEntity.ok(new byte[] { 5, 6 }));

		mockMvc.perform(get("/mealSetTemplateController/viewDownload").param("templateId", "1").param("userId", "2"))
				.andExpect(status().isOk());
	}

}
