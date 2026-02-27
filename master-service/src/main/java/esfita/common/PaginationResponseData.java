package esfita.common;


import java.util.List;

import lombok.Data;
import lombok.ToString;

/**
 * @author DHURAIMURUGAN A
 * @since 01 JULY 2025
 * 
 */
@ToString
@Data
public class PaginationResponseData {
	

	//Long TotalElements;

	Integer NumberOfElements;

	Integer TotalPages;

	List<?> Contents;
	

}
