package com.esfita.entity;

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

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "MS_LOCATION_PK", updatable = false)
	private int mslocationPk;

	@Column(name = "MS_LOCATION_ID")
	private String msLocationId;

	@Column(name = "MS_LOCATION_NAME")
	private String msLocationName;

	@Column(name = "MS_STATUS")
	private String msStatus;

	@Column(name = "MS_CREATED_DATE")
	private Date msCreateDate;

	public int getMslocationPk() {
		return mslocationPk;
	}

	public void setMslocationPk(int mslocationPk) {
		this.mslocationPk = mslocationPk;
	}

	public String getMsLocationId() {
		return msLocationId;
	}

	public void setMsLocationId(String msLocationId) {
		this.msLocationId = msLocationId;
	}

	public String getMsLocationName() {
		return msLocationName;
	}

	public void setMsLocationName(String msLocationName) {
		this.msLocationName = msLocationName;
	}

	public String getMsStatus() {
		return msStatus;
	}

	public void setMsStatus(String msStatus) {
		this.msStatus = msStatus;
	}

	public Date getMsCreateDate() {
		return msCreateDate;
	}

	public void setMsCreateDate(Date msCreateDate) {
		this.msCreateDate = msCreateDate;
	}

}
