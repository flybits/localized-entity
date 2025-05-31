var NumUtil = {
  isNumber: function(val){
    return typeof val === 'number' && !isNaN(val);
  },
  isStrNumber: function(val){
    return NumUtil.isNumber(+val);
  }
};

export default NumUtil;