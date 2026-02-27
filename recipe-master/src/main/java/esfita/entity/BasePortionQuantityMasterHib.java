package esfita.entity;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "base_portion_quantity_master", schema = "dbo")
public class BasePortionQuantityMasterHib  implements Serializable{
	

		/**
		 * 
		 */
		private static final long serialVersionUID = -7770940542823551064L;
	 
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		@Column(name = "id", updatable = false)
		private int id;
	 
		@Column(name = "quantity")
		private double quantity;
	 
		@Column(name = "status")
		private char status;
	 
		@Column(name = "created_date")
		private Date createdDate;
	 
		public int getId() {
			return id;
		}

		public void setId(int id) {
			this.id = id;
		}

		public double getQuantity() {
			return quantity;
		}

		public void setQuantity(double quantity) {
			this.quantity = quantity;
		}

		public char getStatus() {
			return status;
		}

		public void setStatus(char status) {
			this.status = status;
		}

		public Date getCreatedDate() {
			return createdDate;
		}

		public void setCreatedDate(Date createdDate) {
			this.createdDate = createdDate;
		}

		public int getCreatedBy() {
			return createdBy;
		}

		public void setCreatedBy(int createdBy) {
			this.createdBy = createdBy;
		}

		public Date getUpdatedDate() {
			return updatedDate;
		}

		public void setUpdatedDate(Date updatedDate) {
			this.updatedDate = updatedDate;
		}

		public int getUpdateBy() {
			return updateBy;
		}

		public void setUpdateBy(int updateBy) {
			this.updateBy = updateBy;
		}

		public static long getSerialversionuid() {
			return serialVersionUID;
		}

		@Column(name = "created_by")
		private int createdBy;
	 
		@Column(name = "update_date")
		private Date updatedDate;
	 
		@Column(name = "update_by")
		private int updateBy;
	 
	}