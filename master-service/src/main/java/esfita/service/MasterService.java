package esfita.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import esfita.common.AppConstants;
import esfita.common.ResponseDTO;
import esfita.common.RestException;
import esfita.dto.BasePortionQuantityMasterDTO;
import esfita.dto.CategoryMasterDTO;
import esfita.dto.CountryMasterDTO;
import esfita.dto.ItemCategoryMasterDTO;
import esfita.dto.RecipeMealMasterDTO;
import esfita.entity.BasePortionQuantityMasterHib;
import esfita.entity.CategoryMasterHib;
import esfita.entity.CountryMasterHib;
import esfita.entity.ItemCategoryMasterHib;
import esfita.entity.MstUserHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repositoy.BasePortionQuantityMasterRepository;
import esfita.repositoy.CategoryMasterRepository;
import esfita.repositoy.CountryMasterRepository;
import esfita.repositoy.ItemCategoryMasterRepository;
import esfita.repositoy.MstUserRepository;
import esfita.repositoy.RecipeMealMasterRepository;

@Service

public class MasterService {
	private final RecipeMealMasterRepository recipeMealMasterRepository;
	private final MstUserRepository mstUserRepository;
	private final CountryMasterRepository countryMasterRepository;
	private final CategoryMasterRepository categoryMasterRepository;
	private final ItemCategoryMasterRepository itemCategoryMasterRepository;
	private final BasePortionQuantityMasterRepository basePortionQuantityMasterRepository;

	public MasterService(RecipeMealMasterRepository recipeMealMasterRepository, MstUserRepository mstUserRepository,
			CountryMasterRepository countryMasterRepository, CategoryMasterRepository categoryMasterRepository,
			ItemCategoryMasterRepository itemCategoryMasterRepository,
			BasePortionQuantityMasterRepository basePortionQuantityMasterRepository) {
		this.recipeMealMasterRepository = recipeMealMasterRepository;
		this.mstUserRepository = mstUserRepository;
		this.countryMasterRepository = countryMasterRepository;
		this.categoryMasterRepository = categoryMasterRepository;
		this.itemCategoryMasterRepository = itemCategoryMasterRepository;
		this.basePortionQuantityMasterRepository = basePortionQuantityMasterRepository;
	}

	private static final Logger log = LoggerFactory.getLogger(MasterService.class);

	public ResponseDTO<RecipeMealMasterDTO> saveRecipeMealMaster(RecipeMealMasterDTO dto) {
		ResponseDTO<RecipeMealMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null) {
				if (recipeMealMasterRepository.findCode(dto.getRecipeMealcode().toUpperCase().trim()) == null) {

					RecipeMealMasterHib hib = new RecipeMealMasterHib();

					hib.setRecipeMealCode(dto.getRecipeMealcode().toUpperCase().trim());
					hib.setRecipeMealName(dto.getRecipeMealName().toUpperCase().trim());
					hib.setStatus(AppConstants.FLAG_A);
					hib.setCreatedBy(dto.getCreatedBy());
					hib.setCreatedDate(new Date());
					hib.setUpdateBy(dto.getCreatedBy());
					hib.setUpdatedDate(new Date());
					recipeMealMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(dto.getRecipeMealcode() + " " + dto.getRecipeMealName() + " "
							+ AppConstants.MSG_RECORD_CREATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Recipe Meal " + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<List<RecipeMealMasterDTO>> recipeMealMasterList() {
		ResponseDTO<List<RecipeMealMasterDTO>> response = new ResponseDTO<>();
		List<RecipeMealMasterDTO> resList = new ArrayList<>();

		try {
			List<RecipeMealMasterHib> recipeList = recipeMealMasterRepository.orderBy();
			if (recipeList != null && !recipeList.isEmpty()) {
				for (RecipeMealMasterHib hib : recipeList) {
					RecipeMealMasterDTO dto = new RecipeMealMasterDTO();

					dto.setId(hib.getId());
					dto.setRecipeMealcode(hib.getRecipeMealCode());
					dto.setRecipeMealName(hib.getRecipeMealName());
					if (hib.getStatus() == AppConstants.FLAG_A) {
						dto.setStatusStr(AppConstants.ACTIVE);
						dto.setActiveStatus(true);
					} else {
						dto.setStatusStr(AppConstants.IN_ACTIVE);
						dto.setActiveStatus(AppConstants.FALSE);
					}

					dto.setStatus(hib.getStatus());
					MstUserHib user = mstUserRepository.findByUserId(hib.getUpdateBy());
					if (user != null) {
						dto.setUserName(user.getFirstName());
						dto.setEmailId(user.getEmailId());
					}
					dto.setUpdatedDate(hib.getUpdatedDate());
					resList.add(dto);
				}

				response.setMessage("Recipe Meal List " + AppConstants.MSG_RECORD_FETCHED);
				response.setSuccess(AppConstants.TRUE);

			} else {
				response.setMessage("Recipe Meal " + AppConstants.EMPTY);
				response.setSuccess(AppConstants.FALSE);
			}
			response.setData(resList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " Recipe Meal list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Recipe Meal list", e);
			response.setMessage(AppConstants.EXCEPTION);
		}
		log.info("Completed Recipe Meal retrieval process.");
		return response;
	}

	public ResponseDTO<RecipeMealMasterDTO> recipeMealView(int id) {
		ResponseDTO<RecipeMealMasterDTO> response = new ResponseDTO<>();

		try {
			RecipeMealMasterHib recipeMeal = recipeMealMasterRepository.findByRecipeMealId(id);

			if (recipeMeal != null) {
				RecipeMealMasterDTO dto = new RecipeMealMasterDTO();

				dto.setId(recipeMeal.getId());
				dto.setRecipeMealcode(recipeMeal.getRecipeMealCode());
				dto.setRecipeMealName(recipeMeal.getRecipeMealName());
				dto.setStatus(recipeMeal.getStatus());

				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Recipe Meal record " + AppConstants.MSG_RECORD_FETCHED);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Recipe Meal with ID " + id + " " + AppConstants.NOT_FOUND);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Recipe Meal with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Recipe Meal with ID: {}", id, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		log.info("Recipe Meal view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<RecipeMealMasterDTO> recipeMealModify(RecipeMealMasterDTO selectView) {
		ResponseDTO<RecipeMealMasterDTO> response = new ResponseDTO<>();

		try {
			if (selectView != null) {
				RecipeMealMasterHib hib = recipeMealMasterRepository.findByRecipeMealId(selectView.getId());

				if (hib != null) {
					hib.setRecipeMealName(selectView.getRecipeMealName().toUpperCase().trim());
					hib.setUpdateBy(selectView.getUpdatedBy());
					hib.setUpdatedDate(new Date());

					recipeMealMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(selectView.getRecipeMealName() + " " + AppConstants.MSG_RECORD_UPDATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY + selectView.getId());
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.RECIPE_MEAL_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException exception) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.RECIPE_MEAL_MASTER, exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.RECIPE_MEAL_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<RecipeMealMasterDTO> recipeMealStatusUpdate(RecipeMealMasterDTO dto) {

		ResponseDTO<RecipeMealMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null && dto.getId() != 0) {
				RecipeMealMasterHib hib = recipeMealMasterRepository.findByRecipeMealId(dto.getId());
				if (hib != null) {
					char status = Character.toUpperCase(dto.getStatus());
					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.IN_ACTIVATED);
					}
					recipeMealMasterRepository.save(hib);
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException exception) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.RECIPE_MEAL_MASTER, exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.RECIPE_MEAL_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<RecipeMealMasterDTO> checkCode(RecipeMealMasterDTO dto) {
		ResponseDTO<RecipeMealMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				if (recipeMealMasterRepository.findCode(dto.getRecipeMealcode().toUpperCase().trim()) == null) {
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(dto.getRecipeMealcode() + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<CountryMasterDTO> countryMasterSave(CountryMasterDTO dto) {
		ResponseDTO<CountryMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null) {
				if (countryMasterRepository.findCode(dto.getCountryCode().toUpperCase().trim()) == null) {

					CountryMasterHib hib = new CountryMasterHib();

					hib.setCountryCode(dto.getCountryCode().toUpperCase().trim());
					hib.setCountryName(dto.getCountryName().toUpperCase().trim());
					hib.setStatus(AppConstants.FLAG_A);
					hib.setCreatedBy(dto.getCreatedBy());
					hib.setCreatedDate(new Date());
					hib.setUpdateBy(dto.getCreatedBy());
					hib.setUpdatedDate(new Date());
					countryMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(
							dto.getCountryCode() + " " + dto.getCountryName() + " " + AppConstants.MSG_RECORD_CREATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Country " + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.COUNTRY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + AppConstants.COUNTRY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + AppConstants.COUNTRY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<List<CountryMasterDTO>> countryMasterList() {
		ResponseDTO<List<CountryMasterDTO>> response = new ResponseDTO<>();
		List<CountryMasterDTO> resList = new ArrayList<>();

		try {
			List<CountryMasterHib> countryList = countryMasterRepository.orderBy();
			if (countryList != null && !countryList.isEmpty()) {
				for (CountryMasterHib hib : countryList) {
					CountryMasterDTO dto = new CountryMasterDTO();

					dto.setId(hib.getId());
					dto.setCountryCode(hib.getCountryCode());
					dto.setCountryName(hib.getCountryName());
					if (hib.getStatus() == AppConstants.FLAG_A) {
						dto.setStatusStr(AppConstants.ACTIVE);
						dto.setActiveStatus(true);
					} else {
						dto.setStatusStr(AppConstants.IN_ACTIVE);
						dto.setActiveStatus(AppConstants.FALSE);
					}

					dto.setStatus(hib.getStatus());
					MstUserHib user = mstUserRepository.findByUserId(hib.getUpdateBy());
					if (user != null) {
						dto.setUserName(user.getFirstName());
						dto.setEmailId(user.getEmailId());
					}
					dto.setUpdatedDate(hib.getUpdatedDate());
					resList.add(dto);
				}

				response.setMessage("Country List " + AppConstants.MSG_RECORD_FETCHED);
				response.setSuccess(AppConstants.TRUE);

			} else {
				response.setMessage("Country " + AppConstants.EMPTY);
				response.setSuccess(AppConstants.FALSE);
			}
			response.setData(resList);
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " Country list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Country list", e);
			response.setMessage(AppConstants.EXCEPTION);
		}
		return response;
	}

	public ResponseDTO<CountryMasterDTO> countryView(int id) {
		ResponseDTO<CountryMasterDTO> response = new ResponseDTO<>();

		try {
			CountryMasterHib country = countryMasterRepository.findOne(id);

			if (country != null) {
				CountryMasterDTO dto = new CountryMasterDTO();

				dto.setId(country.getId());
				dto.setCountryCode(country.getCountryCode());
				dto.setCountryName(country.getCountryName());
				dto.setStatus(country.getStatus());

				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Country record " + AppConstants.MSG_RECORD_FETCHED);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Country with ID " + id + " " + AppConstants.NOT_FOUND);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Country with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Country with ID: {}", id, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		log.info("Country view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<CountryMasterDTO> countryModify(CountryMasterDTO selectView) {
		ResponseDTO<CountryMasterDTO> response = new ResponseDTO<>();

		try {
			if (selectView != null) {
				CountryMasterHib hib = countryMasterRepository.findOne(selectView.getId());

				if (hib != null) {
					hib.setCountryName(selectView.getCountryName().toUpperCase().trim());
					hib.setUpdateBy(selectView.getUpdatedBy());
					hib.setUpdatedDate(new Date());

					countryMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(selectView.getCountryName() + " " + AppConstants.MSG_RECORD_UPDATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY + selectView.getId());
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.COUNTRY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException exception) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<CountryMasterDTO> countryStatusUpdate(CountryMasterDTO dto) {
		ResponseDTO<CountryMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null && dto.getId() != 0) {
				CountryMasterHib hib = countryMasterRepository.findOne(dto.getId());
				if (hib != null) {
					char status = Character.toUpperCase(dto.getStatus());
					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.IN_ACTIVATED);
					}
					countryMasterRepository.save(hib);
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException exception) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, exception);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<CountryMasterDTO> checkCountryCode(CountryMasterDTO dto) {
		ResponseDTO<CountryMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				if (countryMasterRepository.findCode(dto.getCountryCode().toUpperCase().trim()) == null) {
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(dto.getCountryCode() + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

//		============================================================================================================================
	public ResponseDTO<CategoryMasterDTO> categoryMasterSave(CategoryMasterDTO categoryMasterDTO) {

		ResponseDTO<CategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (categoryMasterDTO != null) {
				CategoryMasterHib existingCategory = categoryMasterRepository
						.findByCode(categoryMasterDTO.getCategoryCode().toUpperCase().trim());

				if (existingCategory == null) {
					CategoryMasterHib newCategory = new CategoryMasterHib();
					newCategory.setCategoryCode(categoryMasterDTO.getCategoryCode().trim().toUpperCase());
					newCategory.setCategoryName(categoryMasterDTO.getCategoryName().trim().toUpperCase());
					newCategory.setStatus(AppConstants.FLAG_A);
					newCategory.setCreatedBy(categoryMasterDTO.getCreatedBy());
					newCategory.setCreatedDate(new Date());
					newCategory.setUpdatedBy(categoryMasterDTO.getCreatedBy());
					newCategory.setUpdatedDate(new Date());

					categoryMasterRepository.save(newCategory);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(categoryMasterDTO.getCategoryCode() + " " + categoryMasterDTO.getCategoryName()
							+ " " + AppConstants.MSG_RECORD_CREATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.COUNTRY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + "Category Master", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + "Category Master", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}

		return response;
	}

	public ResponseDTO<List<CategoryMasterDTO>> categoryMasterList() {
		ResponseDTO<List<CategoryMasterDTO>> response = new ResponseDTO<>();
		List<CategoryMasterDTO> categoryMasterDTOList = new ArrayList<>();

		try {
			List<CategoryMasterHib> categoryMasterList = categoryMasterRepository.orderBy();

			if (categoryMasterList != null && !categoryMasterList.isEmpty()) {
				for (CategoryMasterHib hib : categoryMasterList) {
					CategoryMasterDTO dto = new CategoryMasterDTO();
					dto.setId(hib.getId());
					dto.setCategoryCode(hib.getCategoryCode());
					dto.setCategoryName(hib.getCategoryName());
					dto.setStatus(hib.getStatus());

					if (AppConstants.FLAG_A == hib.getStatus()) {
						dto.setStatusStr(AppConstants.ACTIVE);
						dto.setActiveStatus(AppConstants.TRUE);
					} else {
						dto.setStatusStr(AppConstants.IN_ACTIVE);
						dto.setActiveStatus(AppConstants.FALSE);
					}

					MstUserHib user = mstUserRepository.findByUserId(hib.getUpdatedBy());
					if (user != null) {
						dto.setUserName(user.getFirstName());
						dto.setUserEmail(user.getEmailId());
					}

					dto.setUpdatedDate(hib.getUpdatedDate());
					categoryMasterDTOList.add(dto);
				}

				response.setData(categoryMasterDTOList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("<----Category Details fetched Successfully, No of records--> {}",
						categoryMasterDTOList.size());
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " category list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " category list", e);
		}

		return response;
	}

	public ResponseDTO<CategoryMasterDTO> categoryViewById(int id) {
		ResponseDTO<CategoryMasterDTO> response = new ResponseDTO<>();

		try {
			CategoryMasterHib hib = categoryMasterRepository.findById(id);

			if (hib != null) {
				CategoryMasterDTO dto = new CategoryMasterDTO();
				dto.setId(hib.getId());
				dto.setCategoryCode(hib.getCategoryCode());
				dto.setCategoryName(hib.getCategoryName());
				dto.setStatus(hib.getStatus());
				dto.setStatusStr(hib.getStatus() == AppConstants.FLAG_A ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);

				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

				log.info("Category details fetched successfully for ID: {}", id);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY + "Category not found for ID: " + id);

			}
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
			log.warn(AppConstants.REST_EXCEPTION + " Category fetch by ID: {}", id, re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
			log.error(AppConstants.EXCEPTION + " Category fetch by ID: {}", id, e);
		}

		log.info("Category view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<CategoryMasterDTO> categoryStatusUpdate(CategoryMasterDTO itemDto) {
		ResponseDTO<CategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (itemDto != null && itemDto.getId() != 0) {

				CategoryMasterHib hib = categoryMasterRepository.findById(itemDto.getId());

				if (hib != null) {
					char status = Character.toUpperCase(itemDto.getStatus());

					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.IN_ACTIVATED);
					}

					categoryMasterRepository.save(hib);
					response.setSuccess(AppConstants.TRUE);

					log.info("Category status updated successfully for ID: {} with status: {}", itemDto.getId(),
							status);

				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY + "Category not found for ID: " + itemDto.getId());
					log.warn("Category not found for ID: {}", itemDto.getId());
				}

			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}

		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}

		return response;
	}

	public ResponseDTO<CategoryMasterDTO> categoryMasterModify(CategoryMasterDTO selectView) {
		ResponseDTO<CategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (selectView != null) {
				CategoryMasterHib hib = categoryMasterRepository.findById(selectView.getId());

				if (hib != null) {
					hib.setCategoryName(selectView.getCategoryName().toUpperCase().trim());
					hib.setUpdatedBy(selectView.getUpdatedBy());
					hib.setUpdatedDate(new Date());

					categoryMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(selectView.getCategoryName() + " " + AppConstants.MSG_RECORD_UPDATED);

					log.info("Category updated successfully for ID: {} -> {}", selectView.getId(),
							selectView.getCategoryName());

				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY + selectView.getId());
					log.warn("Category not found for ID: {}", selectView.getId());
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.COUNTRY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.COUNTRY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}

		return response;
	}

	public ResponseDTO<CategoryMasterDTO> checkByCategoryCode(CategoryMasterDTO dto) {
		ResponseDTO<CategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				String categoryCode = dto.getCategoryCode().toUpperCase().trim();

				if (categoryMasterRepository.findByCode(categoryCode) == null) {
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(categoryCode + " " + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " while checking category code", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " while checking category code", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		return response;
	}

	public ResponseDTO<ItemCategoryMasterDTO> itemCategoryMasterSave(ItemCategoryMasterDTO dto) {
		ResponseDTO<ItemCategoryMasterDTO> response = new ResponseDTO<>();
		try {
			ItemCategoryMasterHib hib = new ItemCategoryMasterHib();

			if (dto != null) {
				ItemCategoryMasterHib existing = itemCategoryMasterRepository
						.findByCode(dto.getItemCode().toUpperCase().trim());
				if (existing == null) {
					hib.setItemCategoryCode(dto.getItemCode().trim().toUpperCase());
					hib.setItemCategoryName(dto.getItemName().trim().toUpperCase());
					hib.setStatus(AppConstants.FLAG_A);
					hib.setCreatedBy(dto.getCreatedBy());
					hib.setCreatedDate(new Date());
					hib.setUpdatedBy(dto.getCreatedBy());
					hib.setUpdatedDate(new Date());
					itemCategoryMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(dto.getItemCode() + " " + dto.getItemName() + AppConstants.MSG_RECORD_CREATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Item Category Code already exists");
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error("Database error while saving Item Category Master", dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn("REST exception while saving Item Category Master", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_SAVE);
		} catch (Exception e) {
			log.error("Unexpected exception while saving Item Category Master", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<List<ItemCategoryMasterDTO>> itemCategoryMasterList() {
		ResponseDTO<List<ItemCategoryMasterDTO>> response = new ResponseDTO<>();
		List<ItemCategoryMasterDTO> dtoList = new ArrayList<>();

		try {
			List<ItemCategoryMasterHib> hibList = itemCategoryMasterRepository.orderBy();
			if (hibList != null) {
				for (ItemCategoryMasterHib hib : hibList) {
					ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
					dto.setId(hib.getId());
					dto.setItemCode(hib.getItemCategoryCode());
					dto.setItemName(hib.getItemCategoryName());
					dto.setStatus(hib.getStatus());

					if (hib.getStatus() == AppConstants.FLAG_A) {
						dto.setStatusStr(AppConstants.ACTIVE);
						dto.setActiveStatus(true);
					} else {
						dto.setStatusStr(AppConstants.IN_ACTIVE);
						dto.setActiveStatus(false);
					}

					MstUserHib user = mstUserRepository.findByUserId(hib.getUpdatedBy());
					if (user != null) {
						dto.setUserName(user.getFirstName());
						dto.setUserEmail(user.getEmailId());
					}
					dto.setUpdatedDate(hib.getUpdatedDate());
					dtoList.add(dto);
				}

				response.setData(dtoList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);
				log.info("Item Category Details fetched successfully. Records: {}", dtoList.size());
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY);
			}
		} catch (RestException re) {
			response.setSuccess(AppConstants.FALSE);
			log.warn(AppConstants.REST_EXCEPTION + " item list", re);
		} catch (Exception e) {
			response.setSuccess(AppConstants.FALSE);
			log.error(AppConstants.EXCEPTION + " Item list", e);
		}

		return response;
	}

	public ResponseDTO<ItemCategoryMasterDTO> itemCategoryViewById(int id) {
		ResponseDTO<ItemCategoryMasterDTO> response = new ResponseDTO<>();

		try {
			ItemCategoryMasterHib hib = itemCategoryMasterRepository.findById(id);

			if (hib != null) {
				ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
				dto.setId(hib.getId());
				dto.setItemCode(hib.getItemCategoryCode());
				dto.setItemName(hib.getItemCategoryName());
				dto.setStatus(hib.getStatus());

				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage(AppConstants.MSG_RECORD_FETCHED);

				log.info("Item Details fetched successfully for ID: {}", id);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.IS_EMPTY + " Item not found for ID: " + id);
				log.warn("Item not found for ID: {}", id);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Item not found with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Item fetch by ID", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		log.info("Item view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<ItemCategoryMasterDTO> itemCatagoryStatusUpdate(ItemCategoryMasterDTO dto) {
		ResponseDTO<ItemCategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null && dto.getId() != 0) {
				ItemCategoryMasterHib hib = itemCategoryMasterRepository.findById(dto.getId());

				if (hib != null) {
					char status = Character.toUpperCase(dto.getStatus());

					if (status == AppConstants.FLAG_A) {
						hib.setStatus(AppConstants.FLAG_A);
						response.setMessage(AppConstants.ACTIVATED);
					} else if (status == AppConstants.FLAG_I) {
						hib.setStatus(AppConstants.FLAG_I);
						response.setMessage(AppConstants.IN_ACTIVATED);
					}

					itemCategoryMasterRepository.save(hib);
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.ITEM_CATEGORY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.ITEM_CATEGORY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}

		return response;
	}

	public ResponseDTO<ItemCategoryMasterDTO> itemCatagoryMasterModify(ItemCategoryMasterDTO dto) {
		ResponseDTO<ItemCategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				ItemCategoryMasterHib hib = itemCategoryMasterRepository.findById(dto.getId());

				if (hib != null) {
					hib.setItemCategoryName(dto.getItemName().toUpperCase().trim());
					hib.setUpdatedBy(dto.getUpdatedBy());
					hib.setUpdatedDate(new Date());

					itemCategoryMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(dto.getItemName() + " " + AppConstants.MSG_RECORD_UPDATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY + dto.getId());
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.ITEM_CATEGORY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.ITEM_CATEGORY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.ITEM_CATEGORY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}

		return response;
	}

	public ResponseDTO<ItemCategoryMasterDTO> checkByCode(ItemCategoryMasterDTO dto) {
		ResponseDTO<ItemCategoryMasterDTO> response = new ResponseDTO<>();

		try {
			if (dto != null) {
				if (itemCategoryMasterRepository.findByCode(dto.getItemCode().toUpperCase().trim()) == null) {
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(dto.getItemCode() + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}

		log.info("Item Code checking process completed for Item Code: {}", dto != null ? dto.getItemCode() : "null");
		return response;
	}

//=============================================================================================================================

	public ResponseDTO<BasePortionQuantityMasterDTO> saveBasePortionQuantityMaster(BasePortionQuantityMasterDTO dto) {
		ResponseDTO<BasePortionQuantityMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null) {
				if (basePortionQuantityMasterRepository.findCode(dto.getQuantity()) == null) {

					BasePortionQuantityMasterHib hib = new BasePortionQuantityMasterHib();
					hib.setQuantity(dto.getQuantity());
					hib.setStatus(AppConstants.FLAG_A);
					hib.setCreatedBy(dto.getCreatedBy());
					hib.setCreatedDate(new Date());
					hib.setUpdateBy(dto.getCreatedBy());
					hib.setUpdatedDate(new Date());

					basePortionQuantityMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(dto.getQuantity() + " " + AppConstants.MSG_RECORD_CREATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage("Base Portion Quantity " + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.BASE_PORTION_QUANTITY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_SAVE + AppConstants.BASE_PORTION_QUANTITY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(re.getMessage());
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_SAVING + AppConstants.BASE_PORTION_QUANTITY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_SAVING);
		}
		return response;
	}

	public ResponseDTO<List<BasePortionQuantityMasterDTO>> basePortionQuantityMasterList() {
		ResponseDTO<List<BasePortionQuantityMasterDTO>> response = new ResponseDTO<>();
		List<BasePortionQuantityMasterDTO> dtoList = new ArrayList<>();
		try {
			List<BasePortionQuantityMasterHib> hibList = basePortionQuantityMasterRepository.orderBy();

			if (hibList != null && !hibList.isEmpty()) {
				for (BasePortionQuantityMasterHib hib : hibList) {
					BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
					dto.setId(hib.getId());
					dto.setQuantity(hib.getQuantity());
					dto.setStatus(hib.getStatus());
					dto.setStatusStr(
							hib.getStatus() == AppConstants.FLAG_A ? AppConstants.ACTIVE : AppConstants.IN_ACTIVE);
					dto.setActiveStatus(hib.getStatus() == AppConstants.FLAG_A);

					MstUserHib user = mstUserRepository.findByUserId(hib.getUpdateBy());
					if (user != null) {
						dto.setUserName(user.getFirstName());
						dto.setEmailId(user.getEmailId());
					}
					dto.setUpdatedDate(hib.getUpdatedDate());
					dtoList.add(dto);
				}
				response.setData(dtoList);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Base Portion Quantity List " + AppConstants.MSG_RECORD_FETCHED);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Base Portion Quantity " + AppConstants.EMPTY);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Base Portion Quantity list", re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Base Portion Quantity list", e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}
		log.info("Completed Base Portion Quantity retrieval process.");
		return response;
	}

	public ResponseDTO<BasePortionQuantityMasterDTO> basePortionQuantityMasterView(int id) {
		ResponseDTO<BasePortionQuantityMasterDTO> response = new ResponseDTO<>();
		try {
			BasePortionQuantityMasterHib hib = basePortionQuantityMasterRepository.findOne(id);
			if (hib != null) {
				BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
				dto.setId(hib.getId());
				dto.setQuantity(hib.getQuantity());
				dto.setStatus(hib.getStatus());
				response.setData(dto);
				response.setSuccess(AppConstants.TRUE);
				response.setMessage("Base Portion Quantity record " + AppConstants.MSG_RECORD_FETCHED);
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage("Base Portion Quantity with ID " + id + " " + AppConstants.NOT_FOUND);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION + " Base Portion Quantity with ID: {}", id, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION + " Base Portion Quantity with ID: {}", id, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage("Internal error occurred while retrieving Base Portion Quantity");
		}
		log.info("Base Portion Quantity view process completed for ID: {}", id);
		return response;
	}

	public ResponseDTO<BasePortionQuantityMasterDTO> basePortionQuantityModify(BasePortionQuantityMasterDTO dto) {
		ResponseDTO<BasePortionQuantityMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null) {
				BasePortionQuantityMasterHib hib = basePortionQuantityMasterRepository.findOne(dto.getId());
				if (hib != null) {
					hib.setQuantity(dto.getQuantity());
					hib.setUpdateBy(dto.getUpdatedBy());
					hib.setUpdatedDate(new Date());
					basePortionQuantityMasterRepository.save(hib);

					response.setSuccess(AppConstants.TRUE);
					response.setMessage(dto.getQuantity() + " " + AppConstants.MSG_RECORD_UPDATED);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY + dto.getId());
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (DataAccessException dae) {
			log.error(AppConstants.DATA_EXCEPTION_SAVE + AppConstants.BASE_PORTION_QUANTITY_MASTER, dae);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.DATA_EXCEPTION_SAVE);
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.BASE_PORTION_QUANTITY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.BASE_PORTION_QUANTITY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<BasePortionQuantityMasterDTO> basePortionQuantityStatusUpdate(BasePortionQuantityMasterDTO dto) {
		ResponseDTO<BasePortionQuantityMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null && dto.getId() != 0) {
				BasePortionQuantityMasterHib hib = basePortionQuantityMasterRepository.findOne(dto.getId());
				if (hib != null) {
					char status = Character.toUpperCase(dto.getStatus());
					hib.setStatus(status);
					basePortionQuantityMasterRepository.save(hib);

					response.setMessage(
							status == AppConstants.FLAG_A ? AppConstants.ACTIVATED : AppConstants.IN_ACTIVATED);
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(AppConstants.IS_EMPTY);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION_UPDATE + AppConstants.BASE_PORTION_QUANTITY_MASTER, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION_UPDATE);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION_UPDATE + AppConstants.BASE_PORTION_QUANTITY_MASTER, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION_UPDATE);
		}
		return response;
	}

	public ResponseDTO<BasePortionQuantityMasterDTO> checkQty(BasePortionQuantityMasterDTO dto) {
		ResponseDTO<BasePortionQuantityMasterDTO> response = new ResponseDTO<>();
		try {
			if (dto != null) {
				if (basePortionQuantityMasterRepository.findCode(dto.getQuantity()) == null) {
					response.setSuccess(AppConstants.TRUE);
				} else {
					response.setSuccess(AppConstants.FALSE);
					response.setMessage(dto.getQuantity() + AppConstants.CODE_VALIDATION);
				}
			} else {
				response.setSuccess(AppConstants.FALSE);
				response.setMessage(AppConstants.E_DATA);
			}
		} catch (RestException re) {
			log.warn(AppConstants.REST_EXCEPTION, re);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.REST_EXCEPTION);
		} catch (Exception e) {
			log.error(AppConstants.EXCEPTION, e);
			response.setSuccess(AppConstants.FALSE);
			response.setMessage(AppConstants.EXCEPTION);
		}
		return response;
	}

//Recipe Master

}
