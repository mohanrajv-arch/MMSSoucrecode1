package com.esfita.service;

import com.esfita.util.AppUtils;

public class Password {

	public static void main(String[] args) throws Exception {
//	    String original = "Admin@123";
//		String encrypted = AppUtils.encrypt("Esfita123$%");
//		String encrypted = AppUtils.encrypt("1");
		String decrypted = AppUtils.decrypt("Vl7esVc/ubc4UwUNxLMoiSvxIa+9qUUeQdTo/34aEeE=");

//		 System.getLogger("Encrypted: " + encrypted);
		System.out.println("Encrypted: " + decrypted);
	}

//	public static String getDecryptedPassword(String pass) throws Exception {
//		String encrypted = pass;
//		String decrypted = AppUtils.decrypt(encrypted);
//		return decrypted;
//	}

}

//   o8/dYIeGYL5hPWDcHDk+dInKdStL/hs2sY1zwvmdbYY=

