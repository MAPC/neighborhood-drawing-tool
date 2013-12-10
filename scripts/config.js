report_sets = [
  { category: 'transportation',
    data: [
    {
      table: 'means_transportation_to_work_by_residence', 
      fields: ['ctv_p', 'pubtran_p', 'bicycle_p', 'walk_p', 'other_p'] },
    {
      table: 'travel_time_to_work', 
      fields: ['mlt15_p', 'm15_30_p', 'm30_45_p', 'm45_60_p', 'm60ovr_p'] },
    {
      table: 'vehicles_per_household', 
      fields: ['c0_p', 'c1_p', 'c2_p', 'c3p_p'] }
    ]},

  { category: 'economy',
    data: [
    {
      table: 'poverty_by_household_type', 
      fields: ['pov_hh', 'pov_hh_p'] },
    {
      table: 'unemployment', 
      fields: ['tot_lf', 'emp_lf', 'unemp_num', 'unemp_rt'] }
    ]},

  { category: 'housing',
    data: [
    {
      table: 'housing_cost_burden', 
      fields: ['cb_3050_p', 'cb_50_p'] },
    {
      table: 'rent', 
      fields: ['med_c_r'] },
    {
      table: 'housing_tenure', 
      fields: ['sf_p', 'mf_p', 'oth_p', 'r_hu_p'] }
    ]},

  { category: 'demographics',
    data: [
    {
      table: 'mobility_in_migration', 
      fields: ['same_p', 'diff_p', 'abroad_p'] }
    ]},

  { category: 'education',
    data: [
    {
      table: 'educational_attainment_25_years', 
      fields: ['lths_p', 'hs_p', 'some_c_p', 'assocba_p', 'prof_p'] }
    ]},
]


module.exports = { report_sets: report_sets }