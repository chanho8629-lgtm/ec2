package com.app.bideo.mybatis.handler;

import com.app.bideo.common.enumeration.OAuthProvider;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandler;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

@MappedTypes(OAuthProvider.class)
public class OAuthProviderHandler implements TypeHandler<OAuthProvider> {
    @Override
    public void setParameter(PreparedStatement ps, int i, OAuthProvider parameter, JdbcType jdbcType) throws SQLException {
        ps.setObject(i, parameter == null ? null : parameter.getValue(), Types.OTHER);
    }

    @Override
    public OAuthProvider getResult(ResultSet rs, String columnName) throws SQLException {
        return OAuthProvider.from(rs.getString(columnName));
    }

    @Override
    public OAuthProvider getResult(ResultSet rs, int columnIndex) throws SQLException {
        return OAuthProvider.from(rs.getString(columnIndex));
    }

    @Override
    public OAuthProvider getResult(CallableStatement cs, int columnIndex) throws SQLException {
        return OAuthProvider.from(cs.getString(columnIndex));
    }
}
