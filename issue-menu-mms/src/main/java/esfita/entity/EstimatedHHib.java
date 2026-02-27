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
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "estimation_h", schema = "dbo")
public class EstimatedHHib implements Serializable{/**
	 * 
	 */
	private static final long serialVersionUID = -3952213160729967585L;
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto increment
    @Column(name = "id")
    private int id;

    @Column(name = "location_fk", nullable = false)
    private int locationFk;

   
    @Column(name = "date", nullable = false)
    private Date date;

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


	public Date getDate() {
		return date;
	}


	public void setDate(Date date) {
		this.date = date;
	}


	public Double getTotalCost() {
		return totalCost;
	}


	public void setTotalCost(Double totalCost) {
		this.totalCost = totalCost;
	}


	public Double getTotalPob() {
		return totalPob;
	}


	public void setTotalPob(Double totalPob) {
		this.totalPob = totalPob;
	}


	public String getStatus() {
		return status;
	}


	public void setStatus(String status) {
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


	public int getLastActBy() {
		return lastActBy;
	}


	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}


	public Date getLastActDate() {
		return lastActDate;
	}


	public void setLastActDate(Date lastActDate) {
		this.lastActDate = lastActDate;
	}


	public static long getSerialversionuid() {
		return serialVersionUID;
	}


	@Column(name = "total_cost")
    private Double totalCost;

    @Column(name = "total_pob")
    private Double totalPob;
 
    @Column(name = "status")
    private String status;

    @Column(name = "created_by")
    private int createdBy;

   
    @Column(name = "created_date")
    private Date createdDate;

    @Column(name = "last_act_by")
    private int lastActBy;

  
    @Column(name = "last_act_date")
    private Date lastActDate;

}
