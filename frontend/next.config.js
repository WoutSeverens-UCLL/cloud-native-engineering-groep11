module.exports = {
  env: {
    // API Base URL
    NEXT_PUBLIC_API_URL: "https://cne-azfunction.azurewebsites.net/api",

    // User Functions
    FK_USERS_LOGIN:
      "?code=SpfLEh2LFQxhSWmB4jdsTE6k9vU53nAd4kJmfzd2O66gAzFuHJO6yQ==",
    FK_USERS: "?code=jaHufhTCxLAr2cWhXLw0Mpy7qAk42H2AXG_286XNvWoUAzFuE1ayVA==",
    FK_USERS_SIGNUP:
      "?code=w2Ihl-6mr7N3FzEyQVwXkFaJVrkgAUVfvF7N4soa71pCAzFuctak3A==",

    // Review Functions
    FK_REVIEWS_CREATE:
      "?code=BDT4PvQiVjXwL-fMcQPEEVqq4jOiBzqm0VQJjWC7_zNiAzFuIOmu1Q==",
    FK_REVIEWS_GET_BY_PRODUCT_ID:
      "?code=bU1Vd7_51jn2UKPb3arFnzkcv8hJFKwgvK7sUfBsDzGQAzFu4Gx9mg==",

    // Product Functions
    FK_PRODUCTS:
      "?code=kbNBjLs92qGQz_815N1U2zkmOvCBu2Ckf8X8czXfBl55AzFuy13Bmw==",
    NEXT_PUBLIC_FK_PRODUCTS_GET_BY_ID_SELLER_ID:
      "?code=_qm2wbJVdNmY8X_ZKS9rSJ8AvQ60ASLX3Bm25ocep6_TAzFu3muLew==",
    FK_PRODUCTS_CREATE:
      "?code=6YX2yTQHbonshocdTU0xP4R9r3eCd_Um6iTawOfemzxVAzFueZI2Mw==",
    FK_PRODUCTS_UPDATE:
      "?code=jQPqZjY24L84rQU3WIgV8WC6D11mTpCzWUTnsBAXyqlPAzFuiTOUsQ==",
    FK_PRODUCTS_GET_BY_SELLER_ID:
      "?code=0NuxQoaNRBns1bDWd1_QViHoOegpDTbU8CTVG9_OtoZ8AzFu1q6pXQ==",
    FK_PRODUCTS_DELETE:
      "?code=ntvuTK-VIquX0Q3c3mGfQoeep2f4SpY6zYhhHS34scdcAzFu6ikLxw==",
    FK_PRODUCTS_GET_PARTITION_KEY:
      "?code=ZQ29kb4JYnILdUdL2XayOO7L8vcNJ--0nq80bOQpngqpAzFuK2eN2A==",

    // Payment Functions
    FK_PAYMENTS_CREATE:
      "?code=yI9xNn1N3Oad-qtJrBNJCmsUwTCR7XBB-FEXbtK0fi0FAzFuz9EeHg==",
    FK_PAYMENTS_GET_BY_ORDER_ID:
      "?code=zQUwDq5YiHMjgk6RPZaJWaaM6n09LYBOIqKQ4GUWOHrMAzFuakGiCA==",
    FK_PAYMENTS_UPDATE_STATUS:
      "?code=g2CpGOYL4xYCaaHgCxVq-CifalV3auq7f3D-0qdzAOz6AzFuab2Olw==",

    // Order Functions
    FK_ORDERS_CREATE:
      "?code=-HFOOMdgDWtmy5-ny2WpLv2bawFBypx1_YTDCoANjNltAzFux-q5gA==",
    FK_ORDERS_GET_BY_ID_AND_BUYER_ID:
      "?code=Y4kb5FkcY2aXI9IqkQUBY1wkvL95PKEgtOfeGoR9iZZMAzFu7jM_QQ==",
    FK_ORDERS_UPDATE:
      "?code=YieLL0SOlmiaXpHKJcUoU3gmAhG88zeMpTKtOmGNzvJzAzFuXShL_w==",
    FK_ORDERS_GET_BY_USER:
      "?code=TYWDuyP4Ag6MRASapzP9GDWZkop8DDsKhmpqDXavPTOvAzFujGGVBg==",
    FK_ORDERS_GET_BY_PRODUCT:
      "?code=2UcYug0XjQYD0P7YzeperVm-ocLKVLoioq1VNoj3Uh1AAzFuqfbNVA==",
    FK_ORDERS_DELETE:
      "?code=I7aROzI4m8Io6YNjbv4eE1IMcQY4cpn_ygW-6oBfesV8AzFuUMD9lw==",
    FK_ORDERS_GET_PRODUCTS_BY_ORDER_ID:
      "?code=BoHY0RbDcPPQQ_o0J5APFkloz6p1kmxiceNBuhVNtktyAzFu3GJfWQ==",
    FK_ORDERS_GET_PARTITION_KEY:
      "?code=v_k3dBJnLG6kURf2HfCYJozjTr4HXmB4YNaeXBEb9OJsAzFu_fqQOA==",

    // Cart Functions
    FK_CARTS_CREATE:
      "?code=R3IaRA3pu7R4SYt2JPDpFmH9bJtcpLP6lQCZBmyglXuJAzFufSSctg==",
    FK_CARTS_GET_BY_ID_USER_ID:
      "?code=Vt7icpsDQSo0nWJyfXpAAPTW3Mosfl7Ao2PYmY9beDavAzFuCU2bpQ==",
    FK_CARTS_GET_BY_USER_ID:
      "?code=Y3Er9PtPjfjyyuNyGemcOSspzN-cmixzcX-2f_Pu5aDbAzFu1L42iw==",
    FK_CARTS_ADD_ITEM:
      "?code=ig8tg-YFnc1NeFdWuidUYI-z0icrVBYvapk5JvOrobV9AzFuzctjAA==",
    FK_CARTS_REMOVE_ITEM:
      "?code=RzhZiHzHl64wI4obybbg038kQ019YmdoYeN_Zu-qLIEZAzFu31bE8Q==",
    FK_CARTS_CLEAR:
      "?code=sPjhn129Z74JDjfVQ287OsFk7TiDhMcI2bWJ7KaB2PF0AzFuleiI1w==",
    FK_CARTS_UPDATE_QUANTITY:
      "?code=-WhqbF1mcCzaQxu2C1CcjuDBhYDsJTLMzrD2RmZS-XBHAzFu5EFnrw==",
  },
  output: "export",
};
