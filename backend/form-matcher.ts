/**
 * Government Form Database and Rule Matching Engine
 * Stores preset forms, qualification rules, field definitions
 */

import type { Form, FormField, FormQualification, FormMatchResult, UserProfile, Language } from './types';

// ============== Define Form Fields ==============
const FIELD_DEFINITIONS: Record<string, FormField> = {
  // Basic fields
  name: {
    id: 'name',
    name: 'name',
    type: 'text',
    label: 'Full Name',
    required: true,
  },
  ic_number: {
    id: 'ic_number',
    name: 'ic_number',
    type: 'text',
    label: 'ID Number',
    required: true,
    validation: (val: string) => /^\d{12}$/.test(val?.replace(/-/g, '') || ''),
  },
  phone: {
    id: 'phone',
    name: 'phone',
    type: 'text',
    label: 'Phone Number',
    required: true,
  },
  email: {
    id: 'email',
    name: 'email',
    type: 'text',
    label: 'Email',
    required: false,
  },
  address: {
    id: 'address',
    name: 'address',
    type: 'text',
    label: 'Address',
    required: true,
  },
  date_of_birth: {
    id: 'date_of_birth',
    name: 'date_of_birth',
    type: 'date',
    label: 'Date of Birth',
    required: true,
  },
  marital_status: {
    id: 'marital_status',
    name: 'marital_status',
    type: 'select',
    label: 'Marital Status',
    options: ['single', 'married', 'divorced', 'widowed'],
    required: true,
  },
  children_count: {
    id: 'children_count',
    name: 'children_count',
    type: 'number',
    label: 'Number of Children',
    required: false,
  },
  household_income: {
    id: 'household_income',
    name: 'household_income',
    type: 'number',
    label: 'Annual Household Income (RM)',
    required: true,
  },
  bank_account: {
    id: 'bank_account',
    name: 'bank_account',
    type: 'text',
    label: 'Bank Account',
    required: false,
  },
  consent_processing: {
    id: 'consent_processing',
    name: 'consent_processing',
    type: 'checkbox',
    label: 'I consent to my personal data being processed for this application',
    required: true,
  },
  consent_third_party: {
    id: 'consent_third_party',
    name: 'consent_third_party',
    type: 'checkbox',
    label: 'I consent to third-party background verification',
    required: true,
  },
};

// ============== Sample Form 1: Single Parent Allowance ==============
const FORM_SINGLE_PARENT_ALLOWANCE: Form = {
  id: 'form_spa',
  name: 'Single Parent Allowance (SPA)',
  description: 'Monthly allowance for eligible single-parent families',
  qualifications: {
    minAge: 18,
    maritalStatus: ['single', 'divorced', 'widowed'],
    minChildren: 1,
    maxHouseholdIncome: 5000,
    citizenship: ['Malaysia'],
  },
  requiredFields: [
    FIELD_DEFINITIONS.name,
    FIELD_DEFINITIONS.ic_number,
    FIELD_DEFINITIONS.phone,
    FIELD_DEFINITIONS.date_of_birth,
    FIELD_DEFINITIONS.marital_status,
    FIELD_DEFINITIONS.children_count,
    { ...FIELD_DEFINITIONS.address, label: '居住地址' },
    { ...FIELD_DEFINITIONS.household_income, label: '每月家庭收入' },
    FIELD_DEFINITIONS.bank_account,
    FIELD_DEFINITIONS.consent_processing,
    FIELD_DEFINITIONS.consent_third_party,
  ],
  disclaimers: [
    '提供的所有信息必须真实准确',
    '政府有权进行背景调查以核实申请信息',
    '虚假申报将承担法律责任',
    '补助金每月直接转入指定的银行账户',
  ],
  languages: {
    zh_CN: {
      name: '单亲家庭补助金',
      description: '为符合条件的单亲家庭提供每月补助',
      disclaimers: [
        '提供的所有信息必须真实准确',
        '相关部门有权进行背景调查',
        '虚假申报将承担法律责任',
        '补助金每月转入银行账户',
      ],
    },
    ms_MY: {
      name: 'Elaun Keluarga Ibu Tunggal (SPA)',
      description: 'Memberikan bantuan bulanan kepada keluarga ibu tunggal yang layak',
      disclaimers: [
        'Semua maklumat yang disediakan mesti benar dan tepat',
        'Kerajaan berhak melakukan siasatan latar belakang',
        'Permohonan palsu akan dikenakan tindakan undang-undang',
        'Bantuan akan dipindahkan ke akaun bank setiap bulan',
      ],
    },
    en_US: {
      name: 'Single Parent Allowance (SPA)',
      description: 'Monthly assistance for eligible single-parent families',
      disclaimers: [
        'All information provided must be true and accurate',
        'Government has the right to conduct background checks',
        'False declarations will result in legal action',
        'Assistance is transferred to the designated bank account monthly',
      ],
    },
  },
};

// ============== Sample Form 2: Unemployment Assistance ==============
const FORM_UNEMPLOYMENT_ASSISTANCE: Form = {
  id: 'form_ua',
  name: 'Unemployment Assistance (UA)',
  description: 'Temporary financial assistance for unemployed persons',
  qualifications: {
    minAge: 20,
    maxAge: 65,
    maxHouseholdIncome: 3000,
    citizenship: ['Malaysia'],
  },
  requiredFields: [
    FIELD_DEFINITIONS.name,
    FIELD_DEFINITIONS.ic_number,
    FIELD_DEFINITIONS.phone,
    FIELD_DEFINITIONS.date_of_birth,
    { ...FIELD_DEFINITIONS.address, label: '居住地址' },
    { ...FIELD_DEFINITIONS.household_income, label: '每月家庭收入' },
    {
      id: 'employment_status',
      name: 'employment_status',
      type: 'select',
      label: '就业状态',
      options: ['unemployed_less_3months', 'unemployed_3_12months', 'unemployed_over_1year'],
      required: true,
    },
    {
      id: 'previous_employment',
      name: 'previous_employment',
      type: 'text',
      label: '前一份工作',
      required: true,
    },
    FIELD_DEFINITIONS.bank_account,
    FIELD_DEFINITIONS.consent_processing,
  ],
  disclaimers: [
    '仅适用于已失业的马来西亚公民',
    '需要定期更新就业状态',
    '如获得工作，需立即通知相关部门',
  ],
  languages: {
    zh_CN: {
      name: '失业援助计划',
      description: 'Temporary financial assistance for unemployed persons',
      disclaimers: [
        '仅适用于失业的马来西亚公民',
        '需要定期更新就业状态',
        '如获得工作必须立即通知',
      ],
    },
    ms_MY: {
      name: 'Program Bantuan Pengangguran (UA)',
      description: 'Bantuan ekonomi sementara untuk pengangguran',
      disclaimers: [
        'Hanya untuk warganegara Malaysia yang menganggur',
        'Perlu mengemas kini status pekerjaan secara berkala',
        'Jika mendapat pekerjaan, mesti memberitahu dengan segera',
      ],
    },
    en_US: {
      name: 'Unemployment Assistance Program (UA)',
      description: 'Temporary financial assistance for unemployed persons',
      disclaimers: [
        'Only for unemployed Malaysian citizens',
        'Must update employment status regularly',
        'Must notify immediately if employment is found',
      ],
    },
  },
};

// ============== Sample Form 3: Child Care Allowance ==============
const FORM_CHILD_CARE_ALLOWANCE: Form = {
  id: 'form_cca',
  name: 'Child Care Allowance (CCA)',
  description: 'Assistance for low-income families with multiple children',
  qualifications: {
    minChildren: 2,
    maxHouseholdIncome: 6000,
    citizenship: ['Malaysia'],
  },
  requiredFields: [
    FIELD_DEFINITIONS.name,
    FIELD_DEFINITIONS.ic_number,
    FIELD_DEFINITIONS.phone,
    FIELD_DEFINITIONS.date_of_birth,
    FIELD_DEFINITIONS.marital_status,
    FIELD_DEFINITIONS.children_count,
    {
      id: 'children_details',
      name: 'children_details',
      type: 'text',
      label: '子女详情（名字、年龄、学校等）',
      required: true,
    },
    { ...FIELD_DEFINITIONS.address, label: '居住地址' },
    { ...FIELD_DEFINITIONS.household_income, label: '每月家庭收入' },
    FIELD_DEFINITIONS.bank_account,
    FIELD_DEFINITIONS.consent_processing,
  ],
  disclaimers: [
    '补助金用于子女教育和保育',
    '需要提供学校证明文件',
    '每年需要更新申请',
  ],
  languages: {
    zh_CN: {
      name: '儿童养育补助',
      description: '为低收入多子女家庭提供补助',
      disclaimers: [
        '补助金用于子女教育和照顾',
        '需要学校证明',
        '每年需要更新申请',
      ],
    },
    ms_MY: {
      name: 'Elaun Penjagaan Anak (CCA)',
      description: 'Bantuan untuk keluarga berpendapatan rendah dengan berbilang anak',
      disclaimers: [
        'Dana digunakan untuk pendidikan dan penjagaan anak',
        'Memerlukan surat bukti sekolah',
        'Perlu pembaruan permohonan setiap tahun',
      ],
    },
    en_US: {
      name: 'Child Care Allowance (CCA)',
      description: 'Assistance for low-income families with multiple children',
      disclaimers: [
        'Funds for child education and care',
        'School documentation required',
        'Annual application renewal needed',
      ],
    },
  },
};

// ============== Form Database ==============
const FORMS_DATABASE: Form[] = [FORM_SINGLE_PARENT_ALLOWANCE, FORM_UNEMPLOYMENT_ASSISTANCE, FORM_CHILD_CARE_ALLOWANCE];

// ============== Rule Matching Engine ==============
export class FormMatcher {
  /**
   * 根据用户资料匹配符合的表格
   */
  static matchForms(userProfile: Partial<UserProfile>): FormMatchResult[] {
    return FORMS_DATABASE.map((form) => {
      const matchScore = this.calculateMatchScore(userProfile, form);
      const qualificationsMet = matchScore >= 70;
      const missingFields = this.getMissingRequiredFields(userProfile, form);

      return {
        form,
        matchScore,
        missingFields,
        qualificationsMet,
      };
    })
      .filter((result) => result.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 计算匹配分数（0-100）
   */
  private static calculateMatchScore(
    userProfile: Partial<UserProfile>,
    form: Form,
  ): number {
    let score = 0;
    const qualifications = form.qualifications;

    // Age check (30 points)
    if (userProfile.age) {
      if (
        (!qualifications.minAge || userProfile.age >= qualifications.minAge) &&
        (!qualifications.maxAge || userProfile.age <= qualifications.maxAge)
      ) {
        score += 30;
      } else {
        return 0; // Age requirement not met, return 0 immediately
      }
    }

    // Marital status check (20 points)
    if (userProfile.maritalStatus) {
      if (!qualifications.maritalStatus || qualifications.maritalStatus.includes(userProfile.maritalStatus)) {
        score += 20;
      } else {
        return 0;
      }
    }

    // Children count check (20 points)
    if (userProfile.children !== undefined) {
      if (
        (!qualifications.minChildren || userProfile.children >= qualifications.minChildren) &&
        (!qualifications.maxChildren || userProfile.children <= qualifications.maxChildren)
      ) {
        score += 20;
      } else {
        return 0;
      }
    }

    // Household income check (20 points)
    if (userProfile.householdIncome !== undefined) {
      if (!qualifications.maxHouseholdIncome || userProfile.householdIncome <= qualifications.maxHouseholdIncome) {
        score += 20;
      } else {
        return 0;
      }
    }

    // Information completeness (10 points)
    const infoProvidedCount = Object.values(userProfile).filter((v) => v !== undefined && v !== null).length;
    if (infoProvidedCount >= 5) {
      score += 10;
    } else {
      score += (infoProvidedCount / 5) * 10;
    }

    return Math.min(score, 100);
  }

  /**
   * 获取缺失的必需字段
   */
  private static getMissingRequiredFields(userProfile: Partial<UserProfile>, form: Form): FormField[] {
    const profileKeys = Object.keys(userProfile).filter((key) => userProfile[key as keyof UserProfile] !== undefined);

    return form.requiredFields.filter((field) => {
      // Check if field ID is in user profile
      const profileValue = (userProfile as Record<string, any>)[field.id];
      return profileValue === undefined || profileValue === null || profileValue === '';
    });
  }

  /**
   * 获取所有表格（分页）
   */
  static getAllForms(language: Language = 'zh_CN'): Form[] {
    return FORMS_DATABASE;
  }

  /**
   * 根据 ID 获取表格
   */
  static getFormById(formId: string): Form | undefined {
    return FORMS_DATABASE.find((f) => f.id === formId);
  }
}

export { FORMS_DATABASE, FIELD_DEFINITIONS };
