package com.esfita.dto;

import java.io.Serializable;

import lombok.Data;

@Data
public class ComboBoxDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = 4003377269733806369L;

	private int pk;
	private int locationFk;
	private String code;
	private String name;
	private int pkTwo;
	private boolean check;
	private int pkThree;

	public int getPk() {
		return pk;
	}

	public void setPk(int pk) {
		this.pk = pk;
	}

	public int getLocationFk() {
		return locationFk;
	}

	public void setLocationFk(int locationFk) {
		this.locationFk = locationFk;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getPkTwo() {
		return pkTwo;
	}

	public void setPkTwo(int pkTwo) {
		this.pkTwo = pkTwo;
	}

	public boolean isCheck() {
		return check;
	}

	public void setCheck(boolean check) {
		this.check = check;
	}

	public int getPkThree() {
		return pkThree;
	}

	public void setPkThree(int pkThree) {
		this.pkThree = pkThree;
	}

}
