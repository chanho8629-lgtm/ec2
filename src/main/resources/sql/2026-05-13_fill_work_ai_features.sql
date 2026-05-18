with raw_features as (
    select
        w.id,
        coalesce((
            select wf.file_type
            from tbl_work_file wf
            where wf.work_id = w.id
              and coalesce(wf.file_type, '') not in ('THUMBNAIL')
            order by wf.sort_order, wf.id
            limit 1
        ), w.category, 'VIDEO') as media_type,
        char_length(coalesce(w.title, '')) as title_length,
        char_length(coalesce(w.description, '')) as description_length,
        coalesce(tag_counts.tag_count, 0) as tag_count,
        exists (
            select 1
            from tbl_work_file wf
            where wf.work_id = w.id
              and (
                  coalesce(wf.file_type, '') = 'THUMBNAIL'
                  or coalesce(wf.file_type, '') like 'image/%'
              )
        ) as thumbnail_exists,
        (
            coalesce(w.category, '') ilike '%AI%'
            or coalesce(w.title, '') ilike '%AI%'
            or coalesce(w.description, '') ilike '%AI%'
        ) as is_ai_generated,
        coalesce(w.view_count, 0) as view_count,
        coalesce(w.like_count, 0) as like_count,
        coalesce(w.comment_count, 0) as comment_count,
        coalesce(w.save_count, 0) as save_count,
        greatest(
            0,
            round(
                coalesce(w.like_count, 0)::numeric
                    + greatest(coalesce(w.view_count, 0)::numeric, 1) * 0.03
            )::int
        ) as predicted_like_count
    from tbl_work w
    left join (
        select work_id, count(*)::int as tag_count
        from tbl_work_tag
        group by work_id
    ) tag_counts on tag_counts.work_id = w.id
),
quality_source as (
    select
        rf.*,
        least(
            0.98,
            greatest(
                0.05,
                0.15
                    + least(rf.title_length::double precision / 35.0, 1.0) * 0.22
                    + least(rf.description_length::double precision / 250.0, 1.0) * 0.33
                    + least(rf.tag_count::double precision / 5.0, 1.0) * 0.18
                    + case when rf.thumbnail_exists then 0.12 else 0 end
            )
        ) as quality_ratio,
        least(
            99.0,
            greatest(
                40.0,
                40.0 + (
                    0.15
                    + least(rf.title_length::double precision / 35.0, 1.0) * 0.22
                    + least(rf.description_length::double precision / 250.0, 1.0) * 0.33
                    + least(rf.tag_count::double precision / 5.0, 1.0) * 0.18
                    + case when rf.thumbnail_exists then 0.12 else 0 end
                ) * 59.0
            )
        ) as ai_quality_score
    from raw_features rf
),
feature_source as (
    select
        qs.*,
        greatest(
            0,
            round(
                (
                    8
                    + least(qs.title_length::numeric, 60) * 0.45
                    + least(qs.description_length::numeric, 500) * 0.08
                    + least(qs.tag_count::numeric, 8) * 7
                    + case when qs.thumbnail_exists then 12 else 0 end
                    + case when qs.is_ai_generated then 8 else 0 end
                )
                * (0.2 + qs.quality_ratio * 1.2)
                * greatest(
                    0.2,
                    least(
                        2.0,
                        0.75
                            + ln(1 + coalesce(qs.like_count, 0)) / 10.0
                            + ln(1 + coalesce(qs.comment_count, 0)) / 14.0
                            + ln(1 + coalesce(qs.save_count, 0)) / 16.0
                            + ln(1 + coalesce(qs.view_count, 0)) / 24.0
                    )
                )
            )::bigint
        ) as predicted_views
    from quality_source qs
),
scored as (
    select
        fs.*,
        t.popular_threshold
    from feature_source fs
    cross join (
        select percentile_cont(0.65) within group (order by predicted_views) as popular_threshold
        from feature_source
    ) t
)
update tbl_work w
set media_type = scored.media_type,
    title_length = scored.title_length,
    description_length = scored.description_length,
    tag_count = scored.tag_count,
    thumbnail_exists = scored.thumbnail_exists,
    is_ai_generated = scored.is_ai_generated,
    ai_quality_score = scored.ai_quality_score,
    predicted_views = scored.predicted_views,
    predicted_like_count = scored.predicted_like_count,
    predicted_popular = case
        when scored.quality_ratio >= 0.55
         and scored.predicted_views >= scored.popular_threshold then 1
        else 0
    end,
    predicted_popular_probability = least(
        0.99,
        greatest(
            0.01,
            scored.predicted_views::double precision / nullif(scored.popular_threshold * 1.5, 0)
                * least(1.0, scored.quality_ratio / 0.75)
        )
    )
from scored
where scored.id = w.id;
