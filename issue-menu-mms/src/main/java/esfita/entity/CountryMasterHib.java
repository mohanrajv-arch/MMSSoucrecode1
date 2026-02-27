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
@Table(name = "country_master", schema = "dbo")
public class CountryMasterHib implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 5199334116688864976L;
	
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
		@Column(name = "id", updatable = false)
		private int id;

		public int getId() {
			return id;
		}

		public void setId(int id) {
			this.id = id;
		}

		public String getCountryCode() {
			return countryCode;
		}

		public void setCountryCode(String countryCode) {
			this.countryCode = countryCode;
		}

		public String getCountryName() {
			return countryName;
		}

		public void setCountryName(String countryName) {
			this.countryName = countryName;
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

		@Column(name = "country_code")
		private String countryCode;

		@Column(name = "country_name")
		private String countryName;

		@Column(name = "status")
		private char status;

		@Column(name = "created_date")
		private Date createdDate;

		@Column(name = "created_by")
		private int createdBy;

		@Column(name = "update_date")
		private Date updatedDate;

		@Column(name = "update_by")
		private int updateBy;
}
