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
@Table(name = "item_req_h", schema = "dbo")
public class ItemReqHHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6257429736772720907L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;
	@Column(name = "location_Fk")
	private int locationFk;

	@Column(name = "MENU_FK")
	private String menuFk;

	@Column(name = "REQ_ID")
	private String reqId;

	@Column(name = "FROM_DATE")
	private Date fromDate;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public String getMenuFk() {
		return menuFk;
	}

	public void setMenuFk(String menuFk) {
		this.menuFk = menuFk;
	}

	public String getReqId() {
		return reqId;
	}

	public void setReqId(String reqId) {
		this.reqId = reqId;
	}

	public Date getFromDate() {
		return fromDate;
	}

	public void setFromDate(Date fromDate) {
		this.fromDate = fromDate;
	}

	public Date getToDate() {
		return toDate;
	}

	public void setToDate(Date toDate) {
		this.toDate = toDate;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "TO_DATE")
	private Date toDate;

	@Column(name = "STATUS")
	private char status;

	@Column(name = "CREATED_BY")
	private int createdBy;

	@Column(name = "CREATED_DATE")
	private Date createdDate;

	@Column(name = "remarks")
	private String remarks;
	
	@Column(name = "total_pob")
	private Double totalPob;

	public Double getTotalPob() {
		return totalPob;
	}

	public void setTotalPob(Double totalPob) {
		this.totalPob = totalPob;
	}
}
