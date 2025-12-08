export const PRODUCT_LIST_FIELDS =
  "id,name,slug,permalink,type,price,regular_price,sale_price,on_sale," +
  "price_html,average_rating,rating_count,images,categories,stock_status";

export const PRODUCT_DETAIL_FIELDS =
  "id,name,slug,permalink,type,price,regular_price,sale_price,on_sale," +
  "price_html,average_rating,rating_count,images,tags,categories," +
  "attributes,description,short_description,meta_data,variations," +
  "stock_status,in_stock,manage_stock,stock_quantity,weight";

export const VARIATION_FIELDS =
  "id,price,regular_price,sale_price,on_sale,image,images," +
  "attributes,stock_status,in_stock,manage_stock,stock_quantity," +
  "meta_data,weight";

export const REVIEW_FIELDS =
  "id,product_id,review,rating,reviewer,reviewer_email," +
  "date_created,date_created_gmt,verified,status";

export const CATEGORY_FIELDS = "id,name,slug,parent";

export const ORDER_FIELDS =
  "id,status,currency,total,date_created,customer_id," + "billing, line_items";

export const PRODUCT_LIST_WITH_FILTER_FIELDS =
  PRODUCT_LIST_FIELDS + ",tags,attributes";
