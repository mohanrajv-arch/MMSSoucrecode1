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
@Table(name = "MST_LOCATION_USER_MAPPING", schema = "dbo")
@Getter
@Setter
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MstLocationUserMappingHib implements Serializable {

	private static final long serialVersionUID = 8897891691641236818L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "LU_PK", updatable = false)
	private Integer id;

	@Column(name = "LU_USER_FK")
	private Integer userId;

	@Column(name = "LU_LOCATION_FK")
	private Integer locationFk;

	@Column(name = "LU_STATUS")
	private String status;

	@Column(name = "LU_CREATED_DATE")
	private Date createdDate;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
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

	public Integer getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(Integer locationFk) {
		this.locationFk = locationFk;
	}
}
