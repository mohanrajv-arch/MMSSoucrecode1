package esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "mst_location_menu", schema = "dbo")
public class MstLocationMenuHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 7181185946722290634L;

	public int getLocationPk() {
		return locationPk;
	}

	public void setLocationPk(int locationPk) {
		this.locationPk = locationPk;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "MS_LOCATION_PK", updatable = false)
	private int locationPk;

	@Column(name = "MS_LOCATION_ID")
	private String locationId;

	@Column(name = "MS_LOCATION_NAME")
	private String locationName;

	@Column(name = "MS_STATUS")
	private String status;

	@Column(name = "MS_CREATED_DATE")
	private Date createdDate;

}
